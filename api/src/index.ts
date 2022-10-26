/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

export type { Fetcher, ConnectionFetcher, EdgeFetcher, ObjectFetcher, ModelType, FetcherField, DirectiveArgs } from './Fetcher';
export type { FetchableField, FetchableType, FetchableTypeCategory, FetchableFieldCategory } from './Fetchable';
export { createFetchableType } from "./Fetchable";
export { AbstractFetcher, SpreadFragment, StringValue } from './Fetcher';
export type { AcceptableVariables, UnresolvedVariables } from './Parameter';
export { ParameterRef } from "./Parameter";
export type { FieldOptions } from './FieldOptions';
export type { EnumInputMetadata, EnumInputMetaType } from './EnumInputMetadata';
export { EnumInputMetadataBuilder } from './EnumInputMetadata';
export { TextWriter } from './TextWriter';
export { DependencyManager } from './DependencyManager';
export { createFetcher } from './FetcherProxy';

import { toMd5 } from "./util/Md5";
import { exceptNullValues } from './util/NullValues';
import { iterateMap } from './util/MapIterator';

interface UtilInterace {
    toMd5(value: string): string;
    exceptNullValues<T>(value: T): T;
    iterateMap<K, V>(map: ReadonlyMap<K, V>, onEach: (pair: [K, V]) => void): void;
}

export const util: UtilInterace = { toMd5, exceptNullValues, iterateMap };
