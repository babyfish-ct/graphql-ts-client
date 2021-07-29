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
    readonly fieldMap: ReadonlyMap<string, FetcherField>;
    /**
     * For query/mutation
     */
    toString(): string;
    toFragmentString(): string;
    /**
     * For recoild
     */
    toJSON(): string;
    __supressWarnings__(value: T): never;
}
export declare type ModelType<F> = F extends Fetcher<string, infer M> ? M : never;
export declare abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _fragmentName?;
    private _fetchedEntityType;
    private _unionItemTypes?;
    private _prev?;
    private _str?;
    private _fragmentStr?;
    private _json?;
    private _fieldMap?;
    constructor(ctx: AbstractFetcher<string, any> | [E, string[] | undefined], _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    }, _child?: AbstractFetcher<string, any>, _fragmentName?: string);
    get fetchedEntityType(): E;
    protected addField<F extends AbstractFetcher<string, any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>): F;
    protected removeField<F extends AbstractFetcher<string, any>>(field: string): F;
    protected addEmbbeddable<F extends AbstractFetcher<string, any>>(child: AbstractFetcher<string, any>): F;
    protected addFragment(name: string): Fetcher<E, T>;
    protected abstract createFetcher(negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>, fragmentName?: string): AbstractFetcher<string, any>;
    toString(): string;
    toFragmentString(): string;
    private _toString0;
    private _toString1;
    toJSON(): string;
    private _toJSON0;
    get fieldMap(): ReadonlyMap<string, FetcherField>;
    private _getFieldMap0;
    private static appendIndentTo;
    private static appendFieldTo;
    private static _appendFieldTo0;
    __supressWarnings__(_: T): never;
}
export interface FetcherField {
    readonly args?: {
        readonly [key: string]: any;
    };
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, any>>;
}
