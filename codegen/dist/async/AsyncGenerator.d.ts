/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { GraphQLField } from "graphql";
import { Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
export declare class AsyncGenerator extends Generator {
    constructor(config: GeneratorConfig);
    protected generateServices(queryFields: GraphQLField<unknown, unknown>[], mutationFields: GraphQLField<unknown, unknown>[], promises: Promise<void>[]): Promise<void>;
    private generateEnvironment;
    private generateOperations;
}
