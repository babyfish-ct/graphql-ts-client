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
    readonly indent?: string;
    readonly objectEditable?: boolean;
    readonly arrayEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly excludedTypes?: ReadonlyArray<string>;
    readonly scalarTypeMap?: {
        readonly [key: string]: string | {
            readonly typeName: string;
            readonly importSource: string;
        };
    };
    readonly idFieldMap?: {
        readonly [key: string]: string;
    };
    readonly defaultFetcherExcludeMap?: {
        readonly [key: string]: string[];
    };
    readonly tsEnum?: boolean | 'string' | 'number';
}
export declare function validateConfig(config: any): void;
export declare function validateConfigAndSchema(config: GeneratorConfig, schema: GraphQLSchema): void;
