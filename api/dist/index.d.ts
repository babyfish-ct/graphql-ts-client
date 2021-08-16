/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
export type { Fetcher, ModelType } from './Fetcher';
export { AbstractFetcher } from './Fetcher';
export { DependencyManager } from './DependencyManager';
export { createFetcher } from './FetcherProxy';
export { replaceNullValues } from './util';
