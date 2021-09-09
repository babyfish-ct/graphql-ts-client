/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLEnumType, GraphQLField, GraphQLFieldMap, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLSchema, GraphQLType, GraphQLUnionType, validate } from "graphql";
import { GeneratorConfig, validateConfig, validateConfigAndSchema } from "./GeneratorConfig";
import { mkdir, rmdir, access, createWriteStream, WriteStream } from "fs";
import { promisify } from "util";
import { join } from "path";
import { FetcherWriter, generatedFetcherTypeName } from "./FetcherWriter";
import { EnumWriter } from "./EnumWriter";
import { InputWriter } from "./InputWriter";
import { CommonTypesWriter } from "./CommonTypesWriter";
import { InheritanceInfo } from "./InheritanceInfo";

export abstract class Generator {

    private excludedTypeNames: Set<string>;

    private excludedOperationNames: Set<string>;

    constructor(protected config: GeneratorConfig) {
        validateConfig(config);
        this.excludedTypeNames = new Set<string>(config.excludedTypes ?? []);
        this.excludedOperationNames = new Set<string>(config.excludedOperations ?? []);
    }

    async generate() {
        
        const schema = await this.loadSchema();
        validateConfigAndSchema(this.config, schema);
        if (this.config.recreateTargetDir) {
            await this.rmdirIfNecessary();
        }
        await this.mkdirIfNecessary();

        const inheritanceInfo = new InheritanceInfo(schema);
        const queryType = schema.getQueryType();
        const mutationType = schema.getMutationType();
        const fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType> = [];
        const inputTypes: GraphQLInputObjectType[] = [];
        const enumTypes: GraphQLEnumType[] = [];
        const typeMap = schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__") && !this.excludedTypeNames.has(typeName)) {
                const type = typeMap[typeName]!;
                if (type instanceof GraphQLObjectType || 
                    type instanceof GraphQLInterfaceType ||
                    type instanceof GraphQLUnionType
                ) {
                    fetcherTypes.push(type);
                } else if (type instanceof GraphQLInputObjectType) {
                    inputTypes.push(type);
                } else if (type instanceof GraphQLEnumType) {
                    enumTypes.push(type);
                }
            }
        }
        const promises: Promise<any>[] = [];
        if (fetcherTypes.length !== 0) {
            await this.mkdirIfNecessary("fetchers");
            promises.push(this.generateFetcherTypes(fetcherTypes, inheritanceInfo));
        }
        if (inputTypes.length !== 0) {
            await this.mkdirIfNecessary("inputs");
            promises.push(this.generateInputTypes(inputTypes));
        }
        if (enumTypes.length !== 0) {
            await this.mkdirIfNecessary("enums");
            promises.push(this.generateEnumTypes(enumTypes));
        }

        promises.push(this.generateCommonTypes(schema, inheritanceInfo));

        this.generateServices(schema, promises);

        promises.push(this.writeIndex(schema));

        await Promise.all(promises);
    }

    protected createFetcheWriter(
        modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
        inheritanceInfo: InheritanceInfo,
        stream: WriteStream,
        config: GeneratorConfig
    ): FetcherWriter {
        return new FetcherWriter(
            false,
            modelType,
            inheritanceInfo,
            stream,
            config
        );
    }

    private async loadSchema(): Promise<GraphQLSchema> {
        try {
            const schema = await this.config.schemaLoader(); 
            console.log("Load graphql graphql schema successfully");
            return schema;
        } catch (ex) {
            console.error("Cannot load graphql schema");
            throw ex;
        }
    }

    private async generateFetcherTypes(
        fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType>,
        inheritanceInfo: InheritanceInfo
    ) {
        const dir = join(this.config.targetDir, "fetchers");
        const emptyFetcherNameMap = new Map<GraphQLType, string>();
        const defaultFetcherNameMap = new Map<GraphQLType, string>();
        const promises = fetcherTypes
            .map(async type => {
                const stream = createStreamAndLog(
                    join(dir, `${generatedFetcherTypeName(type, this.config)}.ts`)
                );
                const writer = this.createFetcheWriter(type, inheritanceInfo, stream, this.config);
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
                const stream = createStreamAndLog(join(dir, "index.ts"));
                for (const type of fetcherTypes) {
                    const fetcherTypeName = generatedFetcherTypeName(type, this.config);
                    stream.write(
                        `export type {${fetcherTypeName}} from './${fetcherTypeName}';\n`
                    );
                    const defaultFetcherName = defaultFetcherNameMap.get(type);
                    stream.write(
                        `export {${
                            emptyFetcherNameMap.get(type)
                        }${
                            defaultFetcherName !== undefined ?
                            `, ${defaultFetcherName}` :
                            ''
                        }} from './${fetcherTypeName}';\n`
                    );
                }
                await stream.end();
            })()
        ]);
    }

    private async generateInputTypes(inputTypes: GraphQLInputObjectType[]) {
        const dir = join(this.config.targetDir, "inputs");
        const promises = inputTypes.map(async type => {
            const stream = createStreamAndLog(
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
            const stream = createStreamAndLog(
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

    private async generateCommonTypes(schema: GraphQLSchema, inheritanceInfo: InheritanceInfo) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "CommonTypes.ts")
        );
        new CommonTypesWriter(schema, inheritanceInfo, stream, this.config).write();
        await closeStream(stream);
    }

    private async writeSimpleIndex(dir: string, types: GraphQLNamedType[]) {
        const stream = createStreamAndLog(join(dir, "index.ts"));
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

    protected async mkdirIfNecessary(subDir?: string) {
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

    protected abstract generateServices(schema: GraphQLSchema, promises: Promise<void>[]): Promise<void>;

    private async writeIndex(schema: GraphQLSchema) {
        const stream = createStreamAndLog(join(this.config.targetDir, "index.ts"));
        this.writeIndexCode(stream, schema);
        await closeStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write("export type { ImplementationType } from './CommonTypes';\n");
        stream.write("export { upcastTypes, downcastTypes } from './CommonTypes';\n");
    }
}

export function createStreamAndLog(path: string): WriteStream {
    console.log(`Write code into file: ${path}`);
    return createWriteStream(path);
}

export async function closeStream(stream: WriteStream) {
    return await(promisify(stream.end).call(stream));
}

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const accessAsync = promisify(access);