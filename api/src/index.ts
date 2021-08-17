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
export { createFetcher, createFetchableType } from './FetcherProxy';

import { toMd5 } from "./util/Md5";
import { removeNullValues, exceptNullValues } from './util/NullValues';
import { produce, Draft, PatchListener } from "immer";

interface UtilInterace {
    toMd5(value: string): string;
    removeNullValues(value: any): void;
    exceptNullValues<T>(value: T): T;
    produce<T>(base: T, recipe: (draft: Draft<T>) => void, listener?: PatchListener);
}

export const util: UtilInterace = { toMd5, removeNullValues, exceptNullValues, produce };
