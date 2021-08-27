/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
export type { Fetcher, ModelType, FetcherField, FetchableField, FetchableType, DirectiveArgs } from './Fetcher';
export { AbstractFetcher, FragmentWrapper, StringValue } from './Fetcher';
export type { AcceptableVariables, UnresolvedVariables } from './Parameter';
export type { ParameterRef } from "./Parameter";
export type { FieldOptions } from './FieldOptions';
export { TextWriter } from './TextWriter';
export { DependencyManager } from './DependencyManager';
export { createFetcher, createFetchableType } from './FetcherProxy';
export { buildRequest } from './Request';
import { Draft, PatchListener } from "immer";
interface UtilInterace {
    toMd5(value: string): string;
    removeNullValues(value: any): void;
    exceptNullValues<T>(value: T): T;
    iterateMap<K, V>(map: ReadonlyMap<K, V>, onEach: (pair: [K, V]) => void): void;
    produce<T>(base: T, recipe: (draft: Draft<T>) => void, listener?: PatchListener): any;
}
export declare const util: UtilInterace;
