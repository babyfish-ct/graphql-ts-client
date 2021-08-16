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
import { WriteStream } from "fs";
import { GraphQLField, GraphQLSchema } from "graphql";
import { Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
export declare class ApolloGenerator extends Generator {
    constructor(config: GeneratorConfig);
    protected generateServices(queryFields: GraphQLField<unknown, unknown>[], mutationFields: GraphQLField<unknown, unknown>[], promises: Promise<void>[]): Promise<void>;
    private generateQueries;
    private generateMutations;
    private generateDependencyManager;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): Promise<void>;
}
