import { ConcreteRequest, ReaderFragment } from "relay-runtime";
import { Fetcher } from "graphql-ts-client-api";
export declare class TypedEnvironment {
    private schema;
    private registry;
    constructor(schema: string);
    query<TResponse extends object, TVariables extends object>(operationName: string, fetcher: Fetcher<"Query", TResponse, TVariables>): TypedQuery<TResponse, TVariables>;
    mutation<TResponse extends object, TVariables extends object>(operationName: string, fetcher: Fetcher<"Mutation", TResponse, TVariables>): TypedMutation<TResponse, TVariables>;
    private operation;
    fragment<TFragmentName extends string, TFetchable extends string, TData extends object, TUnresolvedVariables extends object>(name: TFragmentName, fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>): TypedFragment<TFragmentName, TFetchable, TData, TUnresolvedVariables>;
}
export declare type TypedQuery<TResponse extends object, TVariables extends object> = TypedOperation<"Query", TResponse, TVariables>;
export declare type TypedMutation<TResponse extends object, TVariables extends object> = TypedOperation<"Mutation", TResponse, TVariables>;
export interface TypedOperation<TOperationType extends "Query" | "Mutation", TResponse extends object, TVariables extends object> {
    readonly name: string;
    readonly fetcher: Fetcher<TOperationType, TResponse, TVariables>;
    readonly taggedNode: ConcreteRequest;
}
export interface TypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TUnresolvedVariables extends object> {
    readonly name: TFragmentName;
    readonly fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>;
    readonly taggedNode: ReaderFragment;
}
