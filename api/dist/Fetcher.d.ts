/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { FieldOptionsValue } from "./FieldOptions";
export interface Fetcher<E extends string, T extends object, TUnresolvedVariables extends object> {
    readonly fetchableType: FetchableType<E>;
    readonly fieldMap: ReadonlyMap<string, FetcherField>;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    explicitVariableTypeMap: ReadonlyMap<string, string>;
    implicitVariableTypeMap: ReadonlyMap<string, string>;
    implicitVariableValueMap: ReadonlyMap<string, any>;
    " $supressWarnings"(_1: T, _2: TUnresolvedVariables): never;
}
export declare type ModelType<F> = F extends Fetcher<string, infer M, object> ? M : never;
export declare abstract class AbstractFetcher<E extends string, T extends object, TUnresolvedVariables extends object> implements Fetcher<E, T, TUnresolvedVariables> {
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _optionsValue?;
    private _fetchableType;
    private _unionItemTypes?;
    private _prev?;
    private _fieldMap?;
    private _result;
    constructor(ctx: AbstractFetcher<string, object, object> | [FetchableType<E>, string[] | undefined], _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    } | undefined, _child?: AbstractFetcher<string, object, object> | undefined, _optionsValue?: FieldOptionsValue<string, object> | undefined);
    get fetchableType(): FetchableType<E>;
    protected addField<F extends AbstractFetcher<string, object, object>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, object, object>, optionsValue?: FieldOptionsValue<string, object>): F;
    protected removeField<F extends AbstractFetcher<string, object, object>>(field: string): F;
    protected addEmbbeddable<F extends AbstractFetcher<string, object, object>>(child: AbstractFetcher<string, object, object>, fragmentName?: string): F;
    protected abstract createFetcher(negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, object, object>, optionsValue?: FieldOptionsValue<string, object>): AbstractFetcher<string, object, object>;
    get fieldMap(): ReadonlyMap<string, FetcherField>;
    private _getFieldMap0;
    get explicitVariableTypeMap(): ReadonlyMap<string, string>;
    get implicitVariableTypeMap(): ReadonlyMap<string, string>;
    get implicitVariableValueMap(): ReadonlyMap<string, any>;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    private get result();
    private createResult;
    " $supressWarnings"(_: T, _2: TUnresolvedVariables): never;
}
export interface FetchableType<E extends string> {
    readonly entityName: E;
    readonly superTypes: readonly FetchableType<string>[];
    readonly declaredFields: ReadonlyMap<string, FetchableField>;
    readonly fields: ReadonlyMap<string, FetchableField>;
}
export interface FetchableField {
    readonly name: string;
    readonly isPlural: boolean;
    readonly isFunction: boolean;
    readonly argGraphQLTypeMap: ReadonlyMap<string, string>;
}
export interface FetcherField {
    readonly argGraphQLTypes?: ReadonlyMap<string, string>;
    readonly args?: {
        readonly [key: string]: any;
    };
    readonly optionsValue?: FieldOptionsValue<string, object>;
    readonly plural: boolean;
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object, object>>;
}
export declare abstract class FragmentWrapper<TFragmentName extends string, E extends string, T extends object, TUnresolvedVariables extends object> {
    readonly name: TFragmentName;
    readonly fetcher: Fetcher<E, T, TUnresolvedVariables>;
    protected constructor(name: TFragmentName, fetcher: Fetcher<E, T, TUnresolvedVariables>);
}
