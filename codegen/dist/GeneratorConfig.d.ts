import { GraphQLSchema } from "graphql";
export interface GeneratorConfig {
    readonly schemaLoader: () => Promise<GraphQLSchema>;
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly indent?: string;
    readonly objectEditable?: boolean;
    readonly arrayEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly generateOperations?: boolean;
    readonly defaultFetcherExcludeMap?: {
        [key: string]: string[];
    };
}
export declare function validateConfig(config: any): void;
export declare function validateConfigAndSchema(config: GeneratorConfig, schema: GraphQLSchema): void;
