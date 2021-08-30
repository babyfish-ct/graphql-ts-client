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
export declare class Generator {
    protected config: GeneratorConfig;
    private excludedTypeNames;
    private excludedOperationNames;
    constructor(config: GeneratorConfig);
    generate(): Promise<void>;
    protected createFetcheWriter(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, inheritanceInfo: InheritanceInfo, stream: WriteStream, config: GeneratorConfig): FetcherWriter;
    private loadSchema;
    private generateFetcherTypes;
    private generateInputTypes;
    private generateEnumTypes;
    private generateCommonTypes;
    private writeSimpleIndex;
    private rmdirIfNecessary;
    protected mkdirIfNecessary(subDir?: string): Promise<void>;
    protected generateServices(schema: GraphQLSchema, promises: Promise<void>[]): Promise<void>;
    private operationFields;
    private writeIndex;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): Promise<void>;
}
export declare function createStreamAndLog(path: string): WriteStream;
export declare function awaitStream(stream: WriteStream): Promise<any>;
