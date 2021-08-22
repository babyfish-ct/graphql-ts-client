/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { FetchableType, Fetcher } from './Fetcher';
export declare function createFetcher<E extends string, F extends Fetcher<E, object>>(fetchableType: FetchableType<E>, unionEntityTypes: string[] | undefined, methodNames: string[], extension?: FetcherProxyExtension): F;
export declare type FetcherProxyExtension = {
    readonly [key: string]: FetcherProxyExtensionFunc;
};
export interface FetcherProxyExtensionContext {
    readonly proxy: Fetcher<string, object>;
    readonly target: Fetcher<string, object>;
    readonly args: IArguments;
}
declare type FetcherProxyExtensionFunc = (ctx: FetcherProxyExtensionContext) => any;
export declare function createFetchableType<E extends string>(entityName: string, superTypes: readonly FetchableType<string>[], declaredFields: readonly string[]): FetchableTypeImpl<string>;
declare class FetchableTypeImpl<E extends string> implements FetchableType<E> {
    readonly entityName: E;
    readonly superTypes: readonly FetchableType<string>[];
    readonly declaredFields: ReadonlySet<string>;
    private _fields?;
    constructor(entityName: E, superTypes: readonly FetchableType<string>[], declaredFields: ReadonlySet<string>);
    get fields(): ReadonlySet<string>;
}
export {};
