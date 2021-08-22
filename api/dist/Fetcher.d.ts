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
    readonly fetchableType: FetchableType<E>;
    readonly fieldMap: ReadonlyMap<string, FetcherField>;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    __supressWarnings__(value: T): never;
}
export declare type ModelType<F> = F extends Fetcher<string, infer M> ? M : never;
export declare abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _fetchableType;
    private _unionItemTypes?;
    private _prev?;
    private _fieldMap?;
    private _result;
    constructor(ctx: AbstractFetcher<string, any> | [FetchableType<E>, string[] | undefined], _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    } | undefined, _child?: AbstractFetcher<string, any> | undefined);
    get fetchableType(): FetchableType<E>;
    protected addField<F extends AbstractFetcher<string, any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>): F;
    protected removeField<F extends AbstractFetcher<string, any>>(field: string): F;
    protected addEmbbeddable<F extends AbstractFetcher<string, any>>(child: AbstractFetcher<string, any>, fragmentName?: string): F;
    protected abstract createFetcher(negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, any>): AbstractFetcher<string, any>;
    get fieldMap(): ReadonlyMap<string, FetcherField>;
    private _getFieldMap0;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    private get result();
    private createResult;
    __supressWarnings__(_: T): never;
}
export interface FetchableType<E extends string> {
    readonly entityName: E;
    readonly superTypes: readonly FetchableType<string>[];
    readonly declaredFields: ReadonlySet<string>;
    readonly fields: ReadonlySet<string>;
}
export interface FetcherField {
    readonly args?: {
        readonly [key: string]: any;
    };
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object>>;
}
export declare abstract class FragmentWrapper<TFragmentName extends string, E extends string, T extends object> {
    readonly name: TFragmentName;
    readonly fetcher: Fetcher<E, T>;
    protected constructor(name: TFragmentName, fetcher: Fetcher<E, T>);
}
