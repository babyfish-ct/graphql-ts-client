import { buildSchema, GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { mkdir, rmdir, exists, createWriteStream } from "fs";
import { promisify } from "util";
import { join } from "path";
import { FetcherWriter, generatedFetcherTypeName } from "./FetcherWriter";
import { EnumWriter } from "./EnumWriter";
import { InputWriter } from "./InputWriter";

export class Generator {

    constructor(private config: GeneratorConfig) {
    }

    async generate() {
        const schema = await this.parseSchema();
        await this.recreateTargetDir();
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
        if (fetcherTypes.length !== 0) {
            this.generateFetcherTypes(fetcherTypes);
        }
        if (inputTypes.length !== 0) {
            this.generateInputTypes(inputTypes);
        }
        if (enumTypes.length !== 0) {
            this.generateEnumTypes(enumTypes);
        }
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

    private async recreateTargetDir() {
        console.log(this.config.targetDir);
        if (this.config.recreateTargetDir && await existsAsync(this.config.targetDir)) {
            try {
                rmdirAsync(this.config.targetDir);
            } catch (ex) {
                console.error(`'recreateTargetDir' is configured to be true but failed to remove target directory "${this.config.targetDir}"`);
                throw ex;
            }
        }
        if (!await existsAsync(this.config.targetDir)) {
            try {
                mkdirAsync(this.config.targetDir);
            } catch (ex) {
                console.error(`Failed to create target directory "${this.config.targetDir}"`);
                throw ex;
            }
        }
    }

    private async generateFetcherTypes(
        fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType>
    ) {
        const dir = join(this.config.targetDir, "fetchers");
        if (!await existsAsync(dir)) {
            await mkdirAsync(dir);
        }
        const promises = fetcherTypes
            .map(async type => {
                const stream = createWriteStream(
                    join(dir, `${generatedFetcherTypeName(type, this.config)}.ts`)
                );
                new FetcherWriter(type, stream, this.config).write();
                await stream.end();
            });
        await Promise.all([
            ...promises,
            (async () => {
                const stream = createWriteStream(join(dir, "index.ts"));
                for (const type of fetcherTypes) {
                    const generatedName = generatedFetcherTypeName(type, this.config);
                    stream.write(
                        `export type {${generatedName}} from './${generatedName}';\n`
                    );
                }
                await stream.end();
            })()
        ]);
    }

    private async generateInputTypes(inputTypes: GraphQLInputObjectType[]) {
        const dir = join(this.config.targetDir, "inputs");
        if (!await existsAsync(dir)) {
            await mkdirAsync(dir);
        }
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
        if (!await existsAsync(dir)) {
            await mkdirAsync(dir);
        }
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

    private async writeSimpleIndex(dir: string, types: GraphQLNamedType[]) {
        const stream = createWriteStream(join(dir, "index.ts"));
        for (const type of types) {
            stream.write(
                `export type {${type.name}} from './${type.name}';\n`
            );
        }
        await stream.end();
    }
}

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const existsAsync = promisify(exists);