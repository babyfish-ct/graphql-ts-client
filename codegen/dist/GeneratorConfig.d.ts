/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { GraphQLSchema } from "graphql";
export interface GeneratorConfig {
    readonly schemaLoader: () => Promise<GraphQLSchema>;
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly indent?: string;
    readonly objectEditable?: boolean;
    readonly arrayEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly fetchableSuffix?: string;
    readonly generateOperations?: boolean;
    readonly defaultFetcherExcludeMap?: {
        [key: string]: string[];
    };
}
export declare function validateConfig(config: any): void;
export declare function validateConfigAndSchema(config: GeneratorConfig, schema: GraphQLSchema): void;
