/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { EnumInputMetadata } from "./EnumInputMetadata";
import { FetchableType } from "./Fetchable";
import { FieldOptionsValue } from "./FieldOptions";
import { ParameterRef } from "./Parameter";
export interface Fetcher<E extends string, T extends object, TVariables extends object> {
    readonly fetchableType: FetchableType<E>;
    readonly fieldMap: ReadonlyMap<string, FetcherField>;
    readonly directiveMap: ReadonlyMap<string, DirectiveArgs>;
    findField(fieldKey: string): FetcherField | undefined;
    findFieldsByName(fieldName: string): ReadonlyArray<FetcherField>;
    findFieldByName(fieldName: string): FetcherField | undefined;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    variableTypeMap: ReadonlyMap<string, string>;
    " $supressWarnings"(_1: T, _2: TVariables): never;
}
export interface ObjectFetcher<E extends string, T extends object, TVariables extends object> extends Fetcher<E, T, TVariables> {
    readonly " $category": "OBJECT";
}
export interface ConnectionFetcher<E extends string, T extends object, TVariables extends object> extends Fetcher<E, T, TVariables> {
    readonly " $category": "CONNECTION";
}
export interface EdgeFetcher<E extends string, T extends object, TVariables extends object> extends Fetcher<E, T, TVariables> {
    readonly " $category": "EDGE";
}
export declare type ModelType<F> = F extends Fetcher<string, infer M, object> ? M : F extends ObjectFetcher<string, infer M, object> ? M : F extends ConnectionFetcher<string, infer M, object> ? M : F extends EdgeFetcher<string, infer M, object> ? M : never;
export declare abstract class AbstractFetcher<E extends string, T extends object, TVariables extends object> implements Fetcher<E, T, TVariables> {
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private _fieldOptionsValue?;
    private _directive?;
    private _directiveArgs?;
    private _fetchableType;
    private _enumInputMetadata;
    private _unionItemTypes?;
    private _prev?;
    private _fieldMap?;
    private _directiveMap;
    private _result;
    constructor(ctx: AbstractFetcher<string, object, object> | [FetchableType<E>, EnumInputMetadata, string[] | undefined], _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    } | undefined, _child?: AbstractFetcher<string, object, object> | undefined, _fieldOptionsValue?: FieldOptionsValue | undefined, _directive?: string | undefined, _directiveArgs?: DirectiveArgs);
    get fetchableType(): FetchableType<E>;
    protected addField<F extends AbstractFetcher<string, object, object>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, object, object>, optionsValue?: FieldOptionsValue): F;
    protected removeField<F extends AbstractFetcher<string, object, object>>(field: string): F;
    protected addEmbbeddable<F extends AbstractFetcher<string, object, object>>(child: AbstractFetcher<string, object, object>, fragmentName?: string): F;
    protected addDirective<F extends AbstractFetcher<string, object, object>>(directive: string, directiveArgs?: DirectiveArgs): F;
    protected abstract createFetcher(negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<string, object, object>, optionsValue?: FieldOptionsValue, directive?: string, directiveArgs?: object): AbstractFetcher<string, object, object>;
    get fieldMap(): ReadonlyMap<string, FetcherField>;
    private _getFieldMap0;
    get directiveMap(): ReadonlyMap<string, DirectiveArgs>;
    private _getDirectiveMap;
    get variableTypeMap(): ReadonlyMap<string, string>;
    findField(fieldKey: string): FetcherField | undefined;
    findFieldsByName(fieldName: string): ReadonlyArray<FetcherField>;
    private collectFieldsByName;
    findFieldByName(fieldName: string): FetcherField | undefined;
    toString(): string;
    toFragmentString(): string;
    toJSON(): string;
    private get result();
    private createResult;
    " $supressWarnings"(_: T, _2: TVariables): never;
}
export interface FetcherField {
    readonly name: string;
    readonly argGraphQLTypes?: ReadonlyMap<string, string>;
    readonly args?: object;
    readonly fieldOptionsValue?: FieldOptionsValue;
    readonly plural: boolean;
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object, object>>;
}
export declare abstract class SpreadFragment<TFragmentName extends string, E extends string, T extends object, TVariables extends object> {
    readonly name: TFragmentName;
    readonly fetcher: Fetcher<E, T, TVariables>;
    readonly " $__instanceOfSpreadFragment" = true;
    protected constructor(name: TFragmentName, fetcher: Fetcher<E, T, TVariables>);
}
export declare type DirectiveArgs = {
    readonly [key: string]: ParameterRef<string> | StringValue | any;
} | undefined;
export declare class StringValue {
    readonly value: any;
    readonly quotationMarks: boolean;
    constructor(value: any, quotationMarks?: boolean);
}
