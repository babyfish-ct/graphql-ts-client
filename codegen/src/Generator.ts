/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLType, GraphQLUnionType } from "graphql";
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

    constructor(protected config: GeneratorConfig) {
        validateConfig(config);
        this.excludedTypeNames = new Set<string>(config.excludedTypes ?? []);
    }

    async generate() {
        
        const schema = await this.loadSchema();
        validateConfigAndSchema(this.config, schema);
        await this.rmdirIfNecessary();
        await this.mkdirIfNecessary();

        const inheritanceInfo = new InheritanceInfo(schema);
        const fetcherTypes: Array<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType> = [];
        const connectionTypes = new Set<GraphQLObjectType>();
        const edgeTypes = new Set<GraphQLObjectType>();
        const inputTypes: GraphQLInputObjectType[] = [];
        const enumTypes: GraphQLEnumType[] = [];
        const typeMap = schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__") && !this.excludedTypeNames.has(typeName)) {
                const type = typeMap[typeName]!;
                if (type instanceof GraphQLObjectType) {
                    fetcherTypes.push(type);
                    const pair = connectionTypePair(type);
                    if (pair !== undefined) {
                        connectionTypes.add(pair[0]);
                        edgeTypes.add(pair[1])
                    }
                } else if (type instanceof GraphQLInterfaceType || type instanceof GraphQLUnionType) {
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
            promises.push(this.generateFetcherTypes(fetcherTypes, inheritanceInfo, connectionTypes, edgeTypes));
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
        connectionTypes: Set<GraphQLObjectType>,
        edgeTypes: Set<GraphQLObjectType>,
        stream: WriteStream,
        config: GeneratorConfig
    ): FetcherWriter {
        return new FetcherWriter(
            false,
            modelType,
            inheritanceInfo,
            connectionTypes,
            edgeTypes,
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
        inheritanceInfo: InheritanceInfo,
        connectionTypes: Set<GraphQLObjectType>,
        edgeTypes: Set<GraphQLObjectType>
    ) {
        const dir = join(this.config.targetDir, "fetchers");
        const emptyFetcherNameMap = new Map<GraphQLType, string>();
        const defaultFetcherNameMap = new Map<GraphQLType, string>();
        const promises = fetcherTypes
            .map(async type => {
                const stream = createStreamAndLog(
                    join(dir, `${generatedFetcherTypeName(type, this.config)}.ts`)
                );
                const writer = this.createFetcheWriter(
                    type, 
                    inheritanceInfo, 
                    connectionTypes, 
                    edgeTypes,
                    stream, 
                    this.config
                );
                emptyFetcherNameMap.set(type, writer.emptyFetcherName);
                if (writer.defaultFetcherName !== undefined) {
                    defaultFetcherNameMap.set(type, writer.defaultFetcherName);
                }
                writer.write();
                await closeStream(stream);
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

function connectionTypePair(type: GraphQLType): [GraphQLObjectType, GraphQLObjectType] | undefined {
    if (type instanceof GraphQLObjectType) {
        const edges = type.getFields()["edges"];
        if (edges !== undefined) {
            const listType = 
                edges.type instanceof GraphQLNonNull ?
                edges.type.ofType : 
                edges.type;
            if (listType instanceof GraphQLList) {
                const edgeType = 
                    listType.ofType instanceof GraphQLNonNull ?
                    listType.ofType.ofType :
                    listType.ofType;
                if (edgeType instanceof GraphQLObjectType) {
                    const node = edgeType.getFields()["node"];
                    if (node !== undefined) {
                        if (!(edges.type instanceof GraphQLNonNull)) {
                            throw new Error(
                                `The type "${type.name}" is connection, its field "edges" must be not-null list`
                            );
                        }
                        if (!(listType.ofType instanceof GraphQLNonNull)) {
                            throw new Error(
                                `The type "${type.name}" is connection, element of  its field "edges" must be not-null`
                            );
                        }
                        if (!(node.type instanceof GraphQLNonNull)) {
                            throw new Error(
                                `The type "${edgeType}" is edge, its field "node" must be non-null`
                            );
                        } else if (!(node.type.ofType instanceof GraphQLObjectType)) {
                            throw new Error(
                                `The type "${edgeType}" is edge, its field "node" must reference other object type`
                            );
                        }
                        const cursor = edgeType.getFields()["cursor"];
                        if (cursor === undefined) {
                            throw new Error(
                                `The type "${edgeType}" is edge, it must defined a field named "cursor"`
                            );
                        } else {
                            const cursorType = 
                                cursor.type instanceof GraphQLNonNull ?
                                cursor.type.ofType :
                                cursor.type;
                            if (cursorType !== GraphQLString) {
                                throw new Error(
                                    `The type "${edgeType}" is edge, its field "cursor" must be string`
                                );
                            }
                        }
                        return [type, edgeType];
                    }
                }
            }
        }
    }
    return undefined;
}

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const accessAsync = promisify(access);