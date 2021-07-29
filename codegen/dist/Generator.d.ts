/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { GeneratorConfig } from "./GeneratorConfig";
export declare class Generator {
    private config;
    private excludedTypeNames;
    private excludedOperationNames;
    constructor(config: GeneratorConfig);
    generate(): Promise<void>;
    private loadSchema;
    private generateFetcherTypes;
    private generateInputTypes;
    private generateEnumTypes;
    private generateEnvironment;
    private generateImplementationType;
    private generateOperations;
    private writeSimpleIndex;
    private rmdirIfNecessary;
    private mkdirIfNecessary;
    private operationFields;
}
