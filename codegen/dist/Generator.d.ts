/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
/// <reference types="node" />
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { WriteStream } from "fs";
import { FetcherWriter } from "./FetcherWriter";
import { InheritanceInfo } from "./InheritanceInfo";
export declare abstract class Generator {
    protected config: GeneratorConfig;
    private excludedTypeNames;
    constructor(config: GeneratorConfig);
    generate(): Promise<void>;
    protected createFetcheWriter(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, inheritanceInfo: InheritanceInfo, connectionTypes: Set<GraphQLObjectType>, edgeTypes: Set<GraphQLObjectType>, stream: WriteStream, config: GeneratorConfig): FetcherWriter;
    private loadSchema;
    private generateFetcherTypes;
    private generateInputTypes;
    private generateEnumTypes;
    private generateCommonTypes;
    private writeSimpleIndex;
    private rmdirIfNecessary;
    protected mkdirIfNecessary(subDir?: string): Promise<void>;
    protected abstract generateServices(schema: GraphQLSchema, promises: Promise<void>[]): Promise<void>;
    private writeIndex;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): Promise<void>;
}
export declare function createStreamAndLog(path: string): WriteStream;
export declare function closeStream(stream: WriteStream): Promise<any>;
