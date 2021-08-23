import { Fetcher } from "./Fetcher";
export declare function buildRequest(operationType: "Query" | "Mutation", operationName: string, config: RequestConfig): string;
export interface RequestConfig {
    readonly operationKey: string;
    readonly dataKey?: string;
    readonly fetcher?: Fetcher<string, object, object>;
    readonly variableParameterClause?: string;
    readonly variableArgumentClause?: string;
}
