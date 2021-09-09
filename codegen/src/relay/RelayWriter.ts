import { WriteStream } from "fs";
import { GraphQLSchema, printSchema } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";

export class RelayWriter extends Writer {

    constructor(private schema: GraphQLSchema, stream: WriteStream, config: GeneratorConfig) {
        super(stream, config);
    }

    protected isUnderGlobalDir(): boolean {
        return true;
    }

    protected writeCode() {
        
        let relayCode: string;
        if (this.indent === STATIC_IDENT) {
            relayCode = RELAY_CODE;
        } else {
            relayCode = RELAY_CODE.replace(STATIC_IDENT, this.indent);
        }
        this.text(relayCode);

        this.text('\nconst typedEnvironment = new TypedEnvironment(`');
        this.text(printSchema(this.schema));
        this.text('`);');
    }
}

const RELAY_CODE = `import { useMemo } from 'react';
import { Fetcher, util } from "graphql-ts-client-api";
import { 
    loadQuery, 
    useQueryLoader, 
    usePreloadedQuery,
    useLazyLoadQuery, 
    useMutation, 
    useFragment,
    useRefetchableFragment,
    EnvironmentProviderOptions,
    PreloadedQuery, 
    LoadQueryOptions,
    UseMutationConfig,
    usePaginationFragment
} from "react-relay";
import { 
    IEnvironment,
    RenderPolicy,
    FetchPolicy,
    CacheConfig,
    fetchQuery,
    MutationConfig,
    Disposable,
    Environment,
    FetchQueryFetchPolicy,
    FragmentRefs,
    ReadOnlyRecordProxy,
    Variables,
    RecordProxy,
    DataID,
    ConnectionHandler,
    getRelayHandleKey
} from "relay-runtime";
import type { TypedOperation, TypedQuery, TypedMutation, TypedFragment } from 'graphql-ts-client-relay';
import { RelayObservable } from "relay-runtime/lib/network/RelayObservable";
import { useRefetchableFragmentHookType } from "react-relay/relay-hooks/useRefetchableFragment";
import { usePaginationFragmentHookType } from 'react-relay/relay-hooks/usePaginationFragment';
import { TypedEnvironment } from  'graphql-ts-client-relay';

export type { ImplementationType } from './CommonTypes';
export { upcastTypes, downcastTypes } from './CommonTypes';



/*
 * - - - - - - - - - - - - - - - - - - - - 
 *
 * PreloadedQueryOf
 * OperationOf
 * OperationResponseOf
 * QueryVariablesOf
 * FragmentDataOf
 * FragmentKeyOf
 * 
 * OperationType
 * FragmentKeyType
 * - - - - - - - - - - - - - - - - - - - - 
 */



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

export type OperationResponseOf<TTypedOperation> =
    TTypedOperation extends TypedOperation<"Query" | "Mutation", infer TResponse, any> ?
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



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * createTypedQuery
 * createTypedMutation
 * createTypedFragment
 * - - - - - - - - - - - - - - - - - - - - 
 */



export function createTypedQuery<TResponse extends object, TVariables extends object>(
    name: string, 
    fetcher: Fetcher<"Query", TResponse, TVariables>
): TypedQuery<TResponse, TVariables> {
    return typedEnvironment.query(name, fetcher);
}

export function createTypedMutation<TResponse extends object, TVariables extends object>(
    name: string, 
    fetcher: Fetcher<"Mutation", TResponse, TVariables>
): TypedMutation<TResponse, TVariables> {
    return typedEnvironment.mutation(name, fetcher);
}

export function createTypedFragment<
    TFragmentName extends string, 
    TFetchable extends string, 
    TData extends object, 
TUnresolvedVariables extends object
>(
    name: TFragmentName,
    fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>
): TypedFragment<
    TFragmentName, 
    TFetchable, 
    TData, 
    TUnresolvedVariables
> {
    return typedEnvironment.fragment(name, fetcher);
}



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * loadTypedQuery
 * fetchTypedQuery
 * useTypedQueryLoader
 * useTypedPreloadedQuery
 * useTypedLazyLoadQuery
 * useTypedMutation
 * useTypedFragment
 * useTypedRefetchableFragment
 * - - - - - - - - - - - - - - - - - - - - 
 */



export function loadTypedQuery<
    TResponse extends object, 
    TVariables extends object,
    TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}
>(
    environment: IEnvironment,
    query: TypedQuery<TResponse, TVariables>,
    variables: TVariables,
    options?: LoadQueryOptions,
    environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<OperationType<TResponse, TVariables>> {
	return loadQuery<OperationType<TResponse, TVariables>>(
		environment,
		query.taggedNode,
		variables,
		options,
		environmentProviderOptions
	);
}

export function fetchTypedQuery<TResponse extends object, TVariables extends object>(
    environment: Environment,
    query: TypedQuery<TResponse, TVariables>,
    variables: TVariables,
    cacheConfig?: { networkCacheConfig?: CacheConfig | null | undefined, fetchPolicy?: FetchQueryFetchPolicy | null | undefined } | null,
): RelayObservable<TResponse> {
    return fetchQuery<OperationType<TResponse, TVariables>>(
        environment,
        query.taggedNode,
        variables,
        cacheConfig
    );
}

export function useTypedQueryLoader<TResponse extends object, TVariables extends object>(
	query: TypedQuery<TResponse, TVariables>,
	initialQueryReference?: PreloadedQuery<OperationType<TResponse, TVariables>> | null
) {
	return useQueryLoader<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		initialQueryReference
	);
}

export function useTypedPreloadedQuery<TResponse extends object, TVariables extends object>(
    query: TypedQuery<TResponse, TVariables>,
    preloadedQuery: PreloadedQuery<OperationType<TResponse, TVariables>>,
    options?: {
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TResponse {
	const response = usePreloadedQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		preloadedQuery,
		options
	);
    return useMemo(() => {
        return util.exceptNullValues(response);
    }, [response]);
}

export function useTypedLazyLoadQuery<TResponse extends object, TVariables extends object>(
    query: TypedQuery<TResponse, TVariables>,
    variables: TVariables,
    options?: {
        fetchKey?: string | number | undefined;
        fetchPolicy?: FetchPolicy | undefined;
        networkCacheConfig?: CacheConfig | undefined;
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TResponse {
	const response = useLazyLoadQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		variables,
		options
	)
    return useMemo(() => {
        return util.exceptNullValues(response);
    }, [response]);
}

export function useTypedMutation<TResponse extends object, TVariables extends object>(
    mutation: TypedMutation<TResponse, TVariables>,
    commitMutationFn?: (
        environment: IEnvironment, 
        config: MutationConfig<OperationType<TResponse, TVariables>>
    ) => Disposable,
): [(config: UseMutationConfig<OperationType<TResponse, TVariables>>) => Disposable, boolean] {
    return useMutation(mutation.taggedNode, commitMutationFn);
}

export function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, object>,
    fragmentRef: FragmentKeyType<TFragmentName, TData>,
): TData;

export function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, object>,
    fragmentRef: FragmentKeyType<TFragmentName, TData> | undefined,
): TData | undefined{
    const data = useFragment(
        fragment.taggedNode,
        fragmentRef ?? null
    );
    return useMemo(() => {
        return util.exceptNullValues(data) as TData | undefined;
    }, [data]);
}

export function useTypedRefetchableFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, TVariables>,
    fragmentRef: FragmentKeyType<TFragmentName, TData>,
): useRefetchableFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData>;

export function useTypedRefetchableFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, TVariables>,
    fragmentRef: FragmentKeyType<TFragmentName, TData> | undefined,
): useRefetchableFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData | undefined> {
    const tuple = useRefetchableFragment(
        fragment.taggedNode,
        fragmentRef ?? null
    );
    return useMemo(() => {
        return [
            util.exceptNullValues(tuple[0]) as TData | undefined,
            tuple[1]
        ];
    }, [tuple]);
}

export function useTypedPaginationFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, TVariables>,
    parentFragmentRef: FragmentKeyType<TFragmentName, TData>,
): usePaginationFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData>;

export function useTypedPaginationFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: TypedFragment<TFragmentName, TFetchable, TData, TVariables>,
    fragmentRef: FragmentKeyType<TFragmentName, TData> | undefined,
): usePaginationFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData | undefined> {
    const obj = usePaginationFragment(
        fragment.taggedNode,
        fragmentRef ?? null
    );
    return useMemo(() => {
        return {
            ...obj,
            data: util.exceptNullValues(obj.data) as TData | undefined
        };
    }, [obj]);
}

/*
 * - - - - - - - - - - - - - - - - - - - - 
 * getConnection
 * getConnectionID
 * - - - - - - - - - - - - - - - - - - - - 
 */
export function getConnection(
    record: ReadOnlyRecordProxy,
    key: string | {
        readonly key: string,
        readonly handler?: string
    },
    filters?: Variables | null,
): RecordProxy | undefined {
    const connKey = typeof key === "string" ? key : key.key;
    const connHandler = typeof key === "string" ? undefined : key.handler;
    let connection: RecordProxy | null | undefined;
    if (connHandler === undefined) {
        connection = ConnectionHandler.getConnection(record, connKey, filters);
    } else {
        connection = record.getLinkedRecord(getRelayHandleKey(connHandler, connKey));
    }
    return connection !== null ? connection : undefined;
}

export function getConnectionID(
    recordID: DataID,
    key: string | {
        readonly key: string,
        readonly handler?: string
    },
    filters?: Variables | null,
): DataID {
    const connKey = typeof key === "string" ? key : key.key;
    const connHandler = typeof key === "string" ? undefined : key.handler;
    if (connHandler === undefined) {
        return ConnectionHandler.getConnectionID(recordID, connKey, filters);
    }
    return \`\${recordID}:\${getRelayHandleKey(connHandler, connKey)}\`;
}
`;

const STATIC_IDENT = "    ";