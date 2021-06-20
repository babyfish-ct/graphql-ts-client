import { GraphQLSchema } from "graphql";

export interface GeneratorConfig {
    readonly schemaLoader: () => Promise<GraphQLSchema>,
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly indent?: string;
    readonly modelEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly generateOperations?: boolean;
    readonly defaultFetcherExcludeMap?: {[key: string]: string[]}
}
