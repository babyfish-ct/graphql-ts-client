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
import { GraphQLField, GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { WriteStream } from "fs";
export declare class Generator {
    protected config: GeneratorConfig;
    private excludedTypeNames;
    private excludedOperationNames;
    constructor(config: GeneratorConfig);
    generate(): Promise<void>;
    private loadSchema;
    private generateFetcherTypes;
    private generateInputTypes;
    private generateEnumTypes;
    private generateCommonTypes;
    private writeSimpleIndex;
    private rmdirIfNecessary;
    protected mkdirIfNecessary(subDir?: string): Promise<void>;
    protected generateServices(queryFields: GraphQLField<unknown, unknown>[], mutationFields: GraphQLField<unknown, unknown>[], promises: Promise<void>[]): Promise<void>;
    private operationFields;
    private writeIndex;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): Promise<void>;
}
export declare function createStreamAndLog(path: string): WriteStream;
