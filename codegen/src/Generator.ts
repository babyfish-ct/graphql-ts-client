import { buildSchema, GraphQLEnumType, GraphQLField, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLSchema, GraphQLType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { mkdir, rmdir, access, createWriteStream } from "fs";
import { promisify } from "util";
import { join } from "path";
import { FetcherWriter, generatedFetcherTypeName } from "./FetcherWriter";
import { EnumWriter } from "./EnumWriter";
import { InputWriter } from "./InputWriter";
import { Maybe } from "graphql/jsutils/Maybe";
import { argsWrapperTypeName, OperationWriter } from "./OperationWriter";
import { GraphQLClientWriter } from "./GraphQLClientWriter";

export class Generator {

    constructor(private config: GeneratorConfig) {
    }

    async generate() {
        
        const schema = await this.parseSchema();
        if (this.config.recreateTargetDir) {
            await this.rmdirIfNecessary();
        }
        await this.mkdirIfNecessary();

        const queryType = schema.getQueryType();
        const mutationType = schema.getMutationType();
        const fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType> = [];
        const inputTypes: GraphQLInputObjectType[] = [];
        const enumTypes: GraphQLEnumType[] = [];
        const typeMap = schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__")) {
                const type = typeMap[typeName]!;
                if (type !== queryType && type !== mutationType) {
                    if (type instanceof GraphQLObjectType || 
                        type instanceof GraphQLInterfaceType
                    ) {
                        fetcherTypes.push(type);
                    } else if (type instanceof GraphQLInputObjectType) {
                        inputTypes.push(type);
                    } else if (type instanceof GraphQLEnumType) {
                        enumTypes.push(type);
                    }
                }
            }
        }
        const promises: Promise<any>[] = [];
        if (fetcherTypes.length !== 0) {
            await this.mkdirIfNecessary("fetchers");
            promises.push(this.generateFetcherTypes(fetcherTypes));
        }
        if (inputTypes.length !== 0) {
            await this.mkdirIfNecessary("inputs");
            promises.push(this.generateInputTypes(inputTypes));
        }
        if (enumTypes.length !== 0) {
            await this.mkdirIfNecessary("enums");
            promises.push(this.generateEnumTypes(enumTypes));
        }

        const queryFields = this.objFields(queryType);
        const mutationFields = this.objFields(mutationType);
        if (this.config.generateOperations && queryFields.length !== 0 && mutationFields.length !== 0) {
            promises.push(this.generateGraphQLClient());
            if (queryFields.length !== 0) {
                await this.mkdirIfNecessary("queries");
                promises.push(this.generateOperations(false, queryFields));
            }
            if (mutationFields.length !== 0) {
                await this.mkdirIfNecessary("mutations");
                promises.push(this.generateOperations(true, mutationFields));
            }
        }

        await Promise.all(promises);
    }

    private async parseSchema(): Promise<GraphQLSchema> {
        
        let schemaDefinition: string; 
        try {
            schemaDefinition = await this.config.schemaExtractor(); 
            console.log("Get graphql graphql schema definition successfully");
            console.log(schemaDefinition);
        } catch (ex) {
            console.error("Cannot get graphql schema definition");
            throw ex;
        }

        try {
            return buildSchema(schemaDefinition);
        } catch (ex) {
            console.error("Failed to parse graphql schema");
            throw ex;
        }
    }

    private async generateFetcherTypes(
        fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType>
    ) {
        const dir = join(this.config.targetDir, "fetchers");
        const emptyFetcherNameMap = new Map<GraphQLType, string>();
        const defaultFetcherNameMap = new Map<GraphQLType, string>();
        const promises = fetcherTypes
            .map(async type => {
                const stream = createWriteStream(
                    join(dir, `${generatedFetcherTypeName(type, this.config)}.ts`)
                );
                const writer = new FetcherWriter(type, stream, this.config);
                emptyFetcherNameMap.set(type, writer.emptyFetcherName);
                if (writer.defaultFetcherName !== undefined) {
                    defaultFetcherNameMap.set(type, writer.defaultFetcherName);
                }
                writer.write();
                await stream.end();
            });
        
        await Promise.all([
            ...promises,
            (async() => {
                const stream = createWriteStream(join(dir, "index.ts"));
                for (const type of fetcherTypes) {
                    const generatedName = generatedFetcherTypeName(type, this.config);
                    stream.write(
                        `export type {${generatedName}} from './${generatedName}';\n`
                    );
                    const defaultFetcherName = defaultFetcherNameMap.get(type);
                    stream.write(
                        `export {${
                            emptyFetcherNameMap.get(type)
                        }${
                            defaultFetcherName !== undefined ?
                            `, ${defaultFetcherName}` :
                            ''
                        }} from './${generatedName}';\n`
                    );
                }
                await stream.end();
            })()
        ]);
    }

    private async generateInputTypes(inputTypes: GraphQLInputObjectType[]) {
        const dir = join(this.config.targetDir, "inputs");
        const promises = inputTypes.map(async type => {
            const stream = createWriteStream(
                join(dir, `${type.name}.ts`)
            );
            new InputWriter(type, stream, this.config).write();
            await stream.end();
        });
        await Promise.all([
            ...promises,
            this.writeSimpleIndex(dir, inputTypes)
        ]);
    }

    private async generateEnumTypes(enumTypes: GraphQLEnumType[]) {
        const dir = join(this.config.targetDir, "enums");
        const promises = enumTypes.map(async type => {
            const stream = createWriteStream(
                join(dir, `${type.name}.ts`)
            );
            new EnumWriter(type, stream, this.config).write();
            await stream.end();
        });
        await Promise.all([
            ...promises,
            this.writeSimpleIndex(dir, enumTypes)
        ]);
    }

    private async generateGraphQLClient() {
        const stream = createWriteStream(
            join(this.config.targetDir, "GraphQLClient.ts")
        );
        new GraphQLClientWriter(stream, this.config).write();
        await stream.end();
    }

    private async generateOperations(
        mutation: boolean,
        fields: GraphQLField<unknown, unknown>[]
    ) {
        const subDir = mutation ? "mutations" : "queries";
        const promises = fields.map(async field => {
            const stream = createWriteStream(
                join(this.config.targetDir, subDir, `${field.name}.ts`)
            );
            new OperationWriter(mutation, field, stream, this.config).write();
            await stream.end();
        });
        const writeIndex = async() => {
            const stream = createWriteStream(
                join(this.config.targetDir, subDir, "index.ts")
            );
            for (const field of fields) {
                stream.write(`export {${field.name}} from './${field.name}';\n`);
                const argsWrapperName = argsWrapperTypeName(field);
                if (argsWrapperName !== undefined) {
                    stream.write(`export type {${argsWrapperName}} from './${field.name}';\n`);
                }
            }
            stream.end();
        };
        await Promise.all([
            ...promises,
            writeIndex()
        ]);
    }

    private async writeSimpleIndex(dir: string, types: GraphQLNamedType[]) {
        const stream = createWriteStream(join(dir, "index.ts"));
        for (const type of types) {
            stream.write(
                `export type {${type.name}} from './${type.name}';\n`
            );
        }
        await stream.end();
    }

    private async rmdirIfNecessary() {
        const dir = this.config.targetDir;
        try {
            await accessAsync(dir);
        } catch(ex) {
            const error = ex as NodeJS.ErrnoException;
            if (error.code === "ENOENT") {
                return;
            }
            throw ex;
        }
        console.log(`Delete directory "${dir}" and recreate it later`);
        await rmdirAsync(dir, { recursive: true});
    }

    private async mkdirIfNecessary(subDir?: string) {
        const dir = subDir !== undefined ?
            join(this.config.targetDir, subDir) :
            this.config.targetDir;
        try {
            await accessAsync(dir);
        } catch(ex) {
            const error = ex as NodeJS.ErrnoException;
            if (error.code === "ENOENT") {
                console.log(`No directory "${dir}", create it`);
                await mkdirAsync(dir);
            } else {
                throw ex;
            }
        }
    }

    private objFields(
        type: Maybe<GraphQLObjectType>
    ): GraphQLField<unknown, unknown>[] {
        if (type === undefined || type === null) {
            return [];
        }
        const fieldMap = type.getFields();
        const fields = [];
        for (const fieldName in fieldMap) {
            fields.push(fieldMap[fieldName]!!);
        }
        return fields;
    }
}

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const accessAsync = promisify(access);