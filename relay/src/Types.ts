import { 
    PreloadedQuery
} from "react-relay";
import { 
    FragmentRefs
} from "relay-runtime";
import { TypedFragment, TypedOperation, TypedQuery } from "./TypedEnviroment";

export type PreloadedQueryOf<TTypedQuery> =
	TTypedQuery extends TypedQuery<infer TResponse, infer TVariables> ?
	PreloadedQuery<OperationType<TResponse, TVariables>> :
	never
;

export type OperationOf<TTypedOperation> =
	TTypedOperation extends TypedOperation<"Query" | "Mutation", infer TResponse, infer TVariables> ?
	OperationType<TResponse, TVariables> :
	never
;

export type QueryResponseOf<TTypedQuery> =
    TTypedQuery extends TypedQuery<infer TResponse, any> ?
    TResponse :
    never
;

export type QueryVariablesOf<TTypedQuery> =
    TTypedQuery extends TypedQuery<any, infer TVariables> ?
    TVariables :
    never
;

export type FragmentDataOf<TTypedFragment> =
    TTypedFragment extends TypedFragment<string, string, infer TData, object> ?
    TData :
    never;

export type FragmentKeyOf<TTypedFragment> =
    TTypedFragment extends TypedFragment<infer TFragmentName, string, infer TData, object> ? 
    FragmentKeyType<TFragmentName, TData> :
    never
;

export type OperationType<TResponse, TVariables> = {
    readonly response: TResponse,
    readonly variables: TVariables
};

export type FragmentKeyType<TFragmentName extends string, TData extends object> = { 
    readonly " $data": TData, 
    readonly " $fragmentRefs": FragmentRefs<TFragmentName> 
}