/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
export interface Fetcher<E extends string, T extends object> {
    readonly fetchedEntityType: E;
    readonly fieldMap: Map<string, FetcherField>;
    /**
     * For query/mutation
     */
    toString(): string;
    /**
     * For recoild
     */
    toJSON(): string;
    __supressWarnings__(value: T): never;
}
export declare type ModelType<F> = F extends Fetcher<string, infer M> ? M : never;
export declare abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {
    readonly fetchedEntityType: E;
    private _prev;
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _str?;
    private _json?;
    private _fieldMap?;
    constructor(fetchedEntityType: E, _prev: AbstractFetcher<string, any> | undefined, _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    }, _child?: AbstractFetcher<string, any>);
    protected addField<F extends AbstractFetcher<string, any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>): F;
    protected removeField<F extends AbstractFetcher<string, any>>(field: string): F;
    protected abstract createFetcher(prev: AbstractFetcher<string, any> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>): AbstractFetcher<string, any>;
    toString(): string;
    private _toString0;
    toJSON(): string;
    private _toJSON0;
    get fieldMap(): Map<string, FetcherField>;
    private _getFieldMap0;
    private static appendIndentTo;
    private static appendFieldTo;
    __supressWarnings__(_: T): never;
}
interface FetcherField {
    readonly args?: {
        [key: string]: any;
    };
    readonly child?: AbstractFetcher<string, any>;
}
export {};
