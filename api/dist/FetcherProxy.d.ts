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
export declare function createFetcher<E extends string, F extends Fetcher<E, object, object>>(fetchableType: FetchableType<E>, unionEntityTypes: string[] | undefined): F;
export declare function createFetchableType<E extends string>(entityName: E, superTypes: readonly FetchableType<string>[], declaredFields: ReadonlyArray<string | {
    readonly type: "METHOD";
    readonly name: string;
    readonly argGraphQLTypeMap?: {
        readonly [key: string]: string;
    };
}>): FetchableType<E>;
