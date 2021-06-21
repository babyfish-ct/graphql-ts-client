/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
export interface Fetchable {
}
export interface Fetcher<A, T extends object> {
    __supressWarnings__(source: A, value: T): never;
    toString(): string;
    toJSON(): string;
}
export declare type ModelType<F> = F extends Fetcher<unknown, infer M> ? M : never;
export declare abstract class AbstractFetcher<A, T extends object> implements Fetcher<A, T> {
    private _prev;
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _str?;
    private _json?;
    constructor(_prev: AbstractFetcher<unknown, any> | undefined, _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    }, _child?: AbstractFetcher<unknown, any>);
    protected addField<F extends AbstractFetcher<unknown, any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<unknown, any>): F;
    protected removeField<F extends AbstractFetcher<unknown, any>>(field: string): F;
    protected abstract createFetcher(prev: AbstractFetcher<unknown, any> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<unknown, any>): AbstractFetcher<unknown, any>;
    toString(): string;
    private _toString0;
    toJSON(): string;
    private _toJSON0;
    private _getFieldMap;
    private static appendIndentTo;
    private static appendFieldTo;
    __supressWarnings__(_1: A, _2: T): never;
}
