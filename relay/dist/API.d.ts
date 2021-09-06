import { EnvironmentProviderOptions, PreloadedQuery, LoadQueryOptions, UseMutationConfig } from "react-relay";
import { IEnvironment, RenderPolicy, FetchPolicy, CacheConfig, MutationConfig, Disposable, Environment, FetchQueryFetchPolicy } from "relay-runtime";
import { RelayObservable } from "relay-runtime/lib/network/RelayObservable";
import { useRefetchableFragmentHookType } from "react-relay/relay-hooks/useRefetchableFragment";
import { FragmentKeyType, OperationType } from './Types';
import { TypedFragment, TypedMutation, TypedQuery } from './TypedEnviroment';
export declare function loadTypedQuery<TResponse extends object, TVariables extends object, TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}>(environment: IEnvironment, query: TypedQuery<TResponse, TVariables>, variables: TVariables, options?: LoadQueryOptions, environmentProviderOptions?: TEnvironmentProviderOptions): PreloadedQuery<OperationType<TResponse, TVariables>>;
export declare function fetchTypedQuery<TResponse extends object, TVariables extends object>(environment: Environment, query: TypedQuery<TResponse, TVariables>, variables: TVariables, cacheConfig?: {
    networkCacheConfig?: CacheConfig | null | undefined;
    fetchPolicy?: FetchQueryFetchPolicy | null | undefined;
} | null): RelayObservable<TResponse>;
export declare function useTypedQueryLoader<TResponse extends object, TVariables extends object>(query: TypedQuery<TResponse, TVariables>, initialQueryReference?: PreloadedQuery<OperationType<TResponse, TVariables>> | null): import("react-relay/relay-hooks/useQueryLoader").useQueryLoaderHookType<OperationType<TResponse, TVariables>>;
export declare function useTypedPreloadedQuery<TResponse extends object, TVariables extends object>(query: TypedQuery<TResponse, TVariables>, preloadedQuery: PreloadedQuery<OperationType<TResponse, TVariables>>, options?: {
    UNSTABLE_renderPolicy?: RenderPolicy | undefined;
}): TResponse;
export declare function useTypedLazyLoadQuery<TResponse extends object, TVariables extends object>(query: TypedQuery<TResponse, TVariables>, variables: TVariables, options?: {
    fetchKey?: string | number | undefined;
    fetchPolicy?: FetchPolicy | undefined;
    networkCacheConfig?: CacheConfig | undefined;
    UNSTABLE_renderPolicy?: RenderPolicy | undefined;
}): TResponse;
export declare function useTypedMutation<TResponse extends object, TVariables extends object>(mutation: TypedMutation<TResponse, TVariables>, commitMutationFn?: (environment: IEnvironment, config: MutationConfig<OperationType<TResponse, TVariables>>) => Disposable): [(config: UseMutationConfig<OperationType<TResponse, TVariables>>) => Disposable, boolean];
export declare function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(fragment: TypedFragment<TFragmentName, TFetchable, TData, object>, fragmentRef: FragmentKeyType<TFragmentName, TData>): TData;
export declare function useTypedRefetchableFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(fragment: TypedFragment<TFragmentName, TFetchable, TData, TVariables>, fragmentRef: FragmentKeyType<TFragmentName, TData>): useRefetchableFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData>;
