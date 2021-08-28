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
import { ParameterRef } from "./Parameter";
import { TextWriter } from "./TextWriter";

export interface Fetcher<E extends string, T extends object, TVariables extends object> {

    readonly fetchableType: FetchableType<E>;

    readonly fieldMap: ReadonlyMap<string, FetcherField>;

    readonly directiveMap: ReadonlyMap<string, DirectiveArgs>;

    readonly invisibleDirectiveMap: ReadonlyMap<string, DirectiveArgs>;

    toString(): string;

    toFragmentString(): string;

    toJSON(): string; // for recoil

    variableTypeMap: ReadonlyMap<string, string>;

    " $supressWarnings"(_1: T, _2: TVariables): never;
}

export type ModelType<F> = 
    F extends Fetcher<string, infer M, object> ? 
    M : 
    never;

export abstract class AbstractFetcher<E extends string, T extends object, TVariables extends object> implements Fetcher<E, T, TVariables> {

    private _fetchableType: FetchableType<E>;

    private _unionItemTypes?: string[];

    private _prev?: AbstractFetcher<string, object, object>;

    private _fieldMap?: ReadonlyMap<string, FetcherField>;

    private _directiveMap: ReadonlyMap<string, DirectiveArgs>;

    private _invisibleDirectiveMap: ReadonlyMap<string, DirectiveArgs>;

    private _result: Result; 

    constructor(
        ctx: AbstractFetcher<string, object, object> | [FetchableType<E>, string[] | undefined],
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<string, object, object>,
        private _fieldOptionsValue?: FieldOptionsValue<string, { readonly [key: string]: DirectiveArgs}>,
        private _directive?: string,
        private _directiveInvisible?: boolean,
        private _directiveArgs?: DirectiveArgs
    ) {
        if (Array.isArray(ctx)) {
            this._fetchableType = ctx[0];
            this._unionItemTypes = ctx[1] !== undefined && ctx[1].length !== 0 ? ctx[1] : undefined;
        } else {
            this._fetchableType = ctx._fetchableType as FetchableType<E>;
            this._unionItemTypes = ctx._unionItemTypes;
            this._prev = ctx;
        }
    }

    get fetchableType(): FetchableType<E> {
        return this._fetchableType;
    }

    protected addField<F extends AbstractFetcher<string, object, object>>(
        field: string, 
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, object, object>,
        optionsValue?: FieldOptionsValue<string, { readonly [key: string]: DirectiveArgs }>
    ): F {
        return this.createFetcher(
            false,
            field,
            args,
            child,
            optionsValue
        ) as F;
    }

    protected removeField<F extends AbstractFetcher<string, object, object>>(field: string): F {
        if (field === '__typename') {
            throw new Error("__typename cannot be removed");
        }
        return this.createFetcher(
            true,
            field
        ) as F;
    }

    protected addEmbbeddable<F extends AbstractFetcher<string, object, object>>(
        child: AbstractFetcher<string, object, object>,
        fragmentName?: string
    ): F {
        let fieldName: string;
        if (fragmentName !== undefined) {
            if (fragmentName.length === 0) {
                throw new Error("fragmentName cannot be ''");
            }
            if (fragmentName.startsWith("on ")) {
                throw new Error("fragmentName cannot start with 'on '");
            }
            fieldName = `... ${fragmentName}`;
        } else if (child._fetchableType.entityName === this._fetchableType.entityName || child._unionItemTypes !== undefined) {
            fieldName = '...';
        } else {
            fieldName = `... on ${child._fetchableType.entityName}`;
        }
        return this.createFetcher(
            false,
            fieldName,
            undefined,
            child
        ) as F;
    }

    protected addDirective<F extends AbstractFetcher<string, object, object>>(
        directive: string,
        directiveInvisible: boolean,
        directiveArgs?: DirectiveArgs
    ): F {
        return this.createFetcher(
            false,
            "",
            undefined,
            undefined,
            undefined,
            directive,
            directiveInvisible,
            directiveArgs
        ) as F;
    }

    protected abstract createFetcher(
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, object, object>,
        optionsValue?: FieldOptionsValue<string, { readonly [key: string]: DirectiveArgs }>,
        directive?: string,
        directiveInvisible?: boolean,
        directiveArgs?: object
    ): AbstractFetcher<string, object, object>;

    get fieldMap(): ReadonlyMap<string, FetcherField> {
        let m = this._fieldMap;
        if (m === undefined) {
            this._fieldMap = m = this._getFieldMap0();
        }
        return m;
    }

    private _getFieldMap0(): ReadonlyMap<string, FetcherField> {
        const fetchers: AbstractFetcher<string, object, object>[] = [];
        for (let fetcher: AbstractFetcher<string, object, object> | undefined = this; 
            fetcher !== undefined; 
            fetcher = fetcher._prev
        ) {
            if (fetcher._field !== "") {
                fetchers.push(fetcher);
            }
        }
        const fieldMap = new Map<string, FetcherField>();
        for (let i = fetchers.length - 1; i >= 0; --i) {
            const fetcher = fetchers[i];
            if (fetcher._field.startsWith('...')) {
                let childFetchers = fieldMap.get(fetcher._field)?.childFetchers as AbstractFetcher<string, object, object>[];
                if (childFetchers === undefined) {
                    childFetchers = [];
                    fieldMap.set(fetcher._field, { plural: false, childFetchers }); // Fragment cause mutliple child fetchers
                }
                childFetchers.push(fetcher._child!);
            } else {
                if (fetcher._negative) {
                    fieldMap.delete(fetcher._field);
                } else {
                    fieldMap.set(fetcher._field, { 
                        argGraphQLTypes: fetcher.fetchableType.fields.get(fetcher._field)?.argGraphQLTypeMap,
                        args: fetcher._args, 
                        fieldOptionsValue: fetcher._fieldOptionsValue,
                        plural: fetcher.fetchableType.fields.get(fetcher._field)?.isPlural ?? false,
                        childFetchers: fetcher._child === undefined ? undefined: [fetcher._child] // Association only cause one child fetcher
                    });
                }
            }
        }
        return fieldMap;
    }

    get directiveMap(): ReadonlyMap<string, DirectiveArgs> {
        return this.getDirectiveMap(false);
    }

    get invisibleDirectiveMap(): ReadonlyMap<string, DirectiveArgs> {
        return this.getDirectiveMap(true);
    }

    private getDirectiveMap(invisible: boolean): ReadonlyMap<string, DirectiveArgs> {
        let map = invisible ? this._invisibleDirectiveMap : this._directiveMap;
        if (map === undefined) {
            const maps = this.getDirectiveMap0();
            this._directiveMap = maps[0];
            this._invisibleDirectiveMap = maps[1];
            map = invisible ? this._invisibleDirectiveMap : this._directiveMap;
        }
        return map;
    }

    private getDirectiveMap0(): [ReadonlyMap<string, DirectiveArgs>, ReadonlyMap<string, DirectiveArgs>] {
        
        const map = new Map<string, DirectiveArgs>();
        for (let fetcher: AbstractFetcher<string, object, object> | undefined = this; 
            fetcher !== undefined; 
            fetcher = fetcher._prev
        ) {
            if (fetcher._directive !== undefined) {
                if (!fetcher._directiveInvisible) {
                    if (!map.has(fetcher._directive)) {
                        map.set(fetcher._directive, fetcher._directiveArgs);
                    }
                }
            }
        }

        const invisibleMap = new Map<string, DirectiveArgs>();
        for (let fetcher: AbstractFetcher<string, object, object> | undefined = this; 
            fetcher !== undefined; 
            fetcher = fetcher._prev
        ) {
            if (fetcher._directive !== undefined) {
                if (fetcher._directiveInvisible) {
                    if (map[fetcher._directive] !== undefined) {
                        throw new Error(`'${fetcher._directive}' is used as both directive and invisible directive`);
                    }
                    if (!invisibleMap.has(fetcher._directive)) {
                        invisibleMap.set(fetcher._directive, fetcher._directiveArgs);
                    }
                }
            }
        }
        return [map, invisibleMap];
    }

    get variableTypeMap(): ReadonlyMap<string, string> {
        return this.result.variableTypeMap;
    }

    toString(): string {
        return this.result.text;
    }

    toFragmentString(): string {
        return this.result.fragmentText;
    }

    toJSON(): string {
        return JSON.stringify(this.result);
    }

    private get result(): Result {
        let r = this._result;
        if (r === undefined) {
            this._result = r = this.createResult();
        }
        return r;
    }

    private createResult(): Result {
        const writer = new TextWriter();
        const fragmentWriter = new TextWriter();
        let ctx = new ResultContext(writer);
        
        ctx.acceptDirectives(this.directiveMap);
        writer.scope({type: "BLOCK", multiLines: true, suffix: '\n'}, () => {
            ctx.accept(this);
        });

        const renderedFragmentNames = new Set<string>();
        while (true) {
            const fragmentMap = ctx.namedFragmentMap;
            if (fragmentMap.size === 0) {
                break;
            }
            ctx = new ResultContext(fragmentWriter, ctx);
            for (const [fragmentName, fragment] of fragmentMap) {
                if (renderedFragmentNames.add(fragmentName)) {
                    fragmentWriter.text(`fragment ${fragmentName} on ${fragment.fetchableType.entityName} `);
                    ctx.acceptDirectives(fragment.directiveMap);
                    fragmentWriter.scope({type: "BLOCK", multiLines: true, suffix: '\n'}, () => {
                        ctx.accept(fragment);     
                    });
                }
            }
        }

        return {
            text: writer.toString(),
            fragmentText: fragmentWriter.toString(),
            variableTypeMap: ctx.variableTypeMap
        };
    }

    " $supressWarnings"(_: T, _2: TVariables): never {
        throw new Error("' $supressWarnings' is not supported");
    }
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
    readonly args?: {readonly [key: string]: any};
    readonly fieldOptionsValue?: FieldOptionsValue<string, { readonly [key: string]: DirectiveArgs }>;
    readonly plural: boolean;
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object, object>>;
}

export abstract class FragmentWrapper<TFragmentName extends string, E extends string, T extends object, TVariables extends object> {

    protected constructor(readonly name: TFragmentName, readonly fetcher: Fetcher<E, T, TVariables>) {}
}

export type DirectiveArgs = {
    readonly [key: string]: ParameterRef<string> | StringValue | any;
} | undefined;

export class StringValue {
    constructor(
        readonly value: any,
        readonly quotationMarks: boolean = true
    ) {
    }
}

interface Result {
    readonly text: string;
    readonly fragmentText: string;
    readonly variableTypeMap: ReadonlyMap<string, string>;
}

class ResultContext {

    readonly namedFragmentMap = new Map<string, Fetcher<string, object, object>>();

    readonly variableTypeMap: Map<string, string>;

    constructor(
        private readonly writer: TextWriter = new TextWriter(), 
        ctx?: ResultContext
    ) {
        this.variableTypeMap = ctx?.variableTypeMap ?? new Map<string, string>();
    }

    accept(fetcher: Fetcher<string, object, object>) {
        
        const t = this.writer.text.bind(this.writer);

        for (const [fieldName, field] of fetcher.fieldMap) {
            const alias = field.fieldOptionsValue?.alias;
            if (alias !== undefined && alias !== "" && alias !== fieldName) {
                t(`${alias}: `);
            }
            t(fieldName);
            if (field.argGraphQLTypes !== undefined) {
                this.acceptArgs(field.args, field.argGraphQLTypes);
            }
            this.acceptDirectives_(field.fieldOptionsValue?.directives);
            const childFetchers = field.childFetchers;
            if (childFetchers !== undefined && childFetchers.length !== 0) {
                if (fieldName.startsWith("...") && !fieldName.startsWith("... on ")) {
                    const fragmentName = fieldName.substring("...".length).trim();
                    const oldFragment = this.namedFragmentMap.get(fragmentName);
                    for (const childFetcher of childFetchers) {
                        if (oldFragment !== undefined && oldFragment !== childFetcher) {
                            throw new Error(`Conflict fragment name ${fragmentName}`);
                        }
                        this.namedFragmentMap.set(fragmentName, childFetcher);
                    }
                } else {
                    t(' ');
                    this.writer.scope({type: "BLOCK", multiLines: true}, () => {
                        for (const childFetcher of childFetchers) {
                            this.accept(childFetcher);
                        }   
                    });
                }
            }
            t('\n');
        }
    }

    acceptDirectives(directives?: ReadonlyMap<string, DirectiveArgs>) {
        if (directives !== undefined) {
            for (const [directive, args] of directives) {
                this.writer.text(`\n@${directive}`);
                this.acceptArgs(args);
            }
        }
    }

    private acceptDirectives_(directives?: {readonly [key: string]: DirectiveArgs}) {
        if (directives !== undefined) {
            for (const directive in directives) {
                this.writer.text(`\n@${directive}`);
                this.acceptArgs(directives[directive]);
            }
        }
    }

    private acceptArgs(
        args?: object, 
        argGraphQLTypeMap?: ReadonlyMap<string, string> // undefined: directive args; otherwise: field args 
    ) {
        if (args === undefined) {
            return;
        }
        const t = this.writer.text.bind(this.writer);

        let hasField: boolean;
        if (argGraphQLTypeMap !== undefined) {
            hasField = false;
            for (const argName in args) {
                const argGraphQLTypeName = argGraphQLTypeMap.get(argName);
                if (argGraphQLTypeName !== undefined) {
                    hasField = true;
                    break;
                } else {
                    console.warn(`Unexpected argument: ${argName}`);
                }
            }
        } else {
            hasField = Object.keys(args).length !== 0;
        }
        if (hasField) {
            this.writer.scope({type: "ARGUMENTS", multiLines: isMultLineJSON(args)}, () => {
                for (const argName in args) {
                    this.writer.seperator();
                    const arg = args[argName];
                    let argGraphQLTypeName: string | undefined;
                    if (argGraphQLTypeMap !== undefined) {
                        argGraphQLTypeName = argGraphQLTypeMap.get(argName);
                        if (argGraphQLTypeName !== undefined) {
                            if (arg instanceof ParameterRef) {
                                if (arg.graphqlTypeName !== undefined && arg.graphqlTypeName !== argGraphQLTypeName) {
                                    throw new Error(`Argument '${arg.name}' has conflict type, the type of paremter '${argName}' is '${argGraphQLTypeName}' but the graphqlTypeName of ParameterRef is '${arg.graphqlTypeName}'`);
                                }
                                const registeredType = this.variableTypeMap.get(arg.name);
                                if (registeredType !== undefined && registeredType !== argGraphQLTypeName) {
                                    throw new Error(`Argument '${arg.name}' has conflict type, it's typed has been specified twice, one as '${registeredType}' and one as '${argGraphQLTypeName}'`);
                                }
                                this.variableTypeMap.set(arg.name, argGraphQLTypeName);
                                t(`${argName}: $${arg.name}`);
                            } else {
                                t(`${argName}: `);
                                this.acceptLiteral(arg);
                            }
                        } else {
                            throw new Error(`Unknown argument '${argName}'`);
                        }
                    } else {
                        if (arg instanceof ParameterRef) {
                            if (arg.graphqlTypeName === undefined) {
                                throw new Error(`The graphqlTypeName of directive argument '${arg.name}' is not specifed`);
                            }
                            this.variableTypeMap.set(arg.name, arg.graphqlTypeName);
                            t(`${argName}: $${arg.name}`);
                        } else {
                            t(`${argName}: `);
                            this.acceptLiteral(arg);
                        }
                    }
                }
            });
        }
    }

    private acceptLiteral(value: any) {

        const t = this.writer.text.bind(this.writer);

        if (value === undefined || value === null) {
            t("null");
        } else if (typeof value === 'number') {
            t(value.toString());
        } else if (typeof value === 'string') {
            t(`"${value.replace('"', '\\"')}"`);
        } else if (typeof value === 'boolean') {
            t(value ? "true" : "false");
        } else if (value instanceof StringValue) {
            if (value.quotationMarks) {
                t(`"${value.value.replace('"', '\\"')}"`);
            } else {
                t(value.value);
            }
        } else if (Array.isArray(value) || value instanceof Set) {
            this.writer.scope({type: "ARRAY"}, () => {
                for (const e of value) {
                    this.writer.seperator();
                    this.acceptLiteral(e);
                }
            });
        } else if (value instanceof Map) {
            for (const [k, v] of value) {
                this.writer.seperator();
                this.acceptMapKey(k);
                t(": ");
                this.acceptLiteral(v);
            }
        } else if (typeof value === 'object') {
            for (const k in value) {
                this.writer.seperator();
                this.acceptMapKey(k);
                t(": ");
                this.acceptLiteral(value[k]);
            }
        }
    }

    private acceptMapKey(key: any) {
        if (typeof key === "string") {
            this.writer.text(`"${key.replace('"', '\\"')}"`);
        } else if (typeof key === "number") {
            this.writer.text("${key}");
        } else {
            throw new Error(`Unsupported map key ${key}`);
        }
    }
}

function isMultLineJSON(obj: any): boolean {
    let size = 0;
    if (Array.isArray(obj)) {
        for (const value of obj) {
            if (typeof value === 'object' && !(value instanceof ParameterRef)) {
                return true;
            }
            if (++size > 2) {
                return true;
            }
        }
    } else if (typeof obj === 'object') {
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'object' && !(value instanceof ParameterRef)) {
                return true;
            }
            if (++size > 2) {
                return true;
            }
        }
    }
    return false;
}