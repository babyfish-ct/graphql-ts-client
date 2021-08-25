/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { ParameterRef } from "./Parameter";
import { TextWriter } from "./TextWriter";

 export interface Fetcher<E extends string, T extends object, TUnresolvedVariables extends object> {

    readonly fetchableType: FetchableType<E>;

    readonly fieldMap: ReadonlyMap<string, FetcherField>;

    toString(): string;

    toFragmentString(): string;

    toJSON(): string; // for recoil

    explicitVariableMap: ReadonlyMap<string, string>;

    implicitVariableMap: ReadonlyMap<string, string>;

    __supressWarnings__(value: T, unresolvedVariables: TUnresolvedVariables): never;
}

export type ModelType<F> = 
    F extends Fetcher<string, infer M, object> ? 
    M : 
    never;

export abstract class AbstractFetcher<E extends string, T extends object, TUnresolvedVariables extends object> implements Fetcher<E, T, TUnresolvedVariables> {

    private _fetchableType: FetchableType<E>;

    private _unionItemTypes?: string[];

    private _prev?: AbstractFetcher<string, object, object>;

    private _fieldMap?: Map<string, FetcherField>;

    private _result: Result;    

    constructor(
        ctx: AbstractFetcher<string, object, object> | [FetchableType<E>, string[] | undefined],
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<string, object, object>
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
        child?: AbstractFetcher<string, object, object>
    ): F {
        return this.createFetcher(
            false,
            field,
            args,
            child
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
    ) {
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

    protected abstract createFetcher(
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, object, object>
    ): AbstractFetcher<string, object, object>;

    get fieldMap(): ReadonlyMap<string, FetcherField> {
        let m = this._fieldMap;
        if (m === undefined) {
            this._fieldMap = m = this._getFieldMap0();
        }
        return m;
    }

    private _getFieldMap0(): Map<string, FetcherField> {
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
                        plural: fetcher.fetchableType.fields.get(fetcher._field)!.isPlural,
                        childFetchers: fetcher._child === undefined ? undefined: [fetcher._child] // Association only cause one child fetcher
                    });
                }
            }
        }
        return fieldMap;
    }

    get explicitVariableMap(): ReadonlyMap<string, string> {
        return this.result.explicitVariableMap;
    }

    get implicitVariableMap(): ReadonlyMap<string, string> {
        return this.result.implicitVariableMap;
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
                    fragmentWriter.scope({type: "BLOCK", multiLines: true, suffix: '\n'}, () => {
                        ctx.accept(fragment);     
                    });
                }
            }
        }

        return {
            text: writer.toString(),
            fragmentText: fragmentWriter.toString(),
            explicitVariableMap: ctx.explicitVariableMap,
            implicitVariableMap: ctx.implicitVariableMap
        };
    }

    __supressWarnings__(_: T, unresolvedVariables: TUnresolvedVariables): never {
        throw new Error("__supressWarnings is not supported");
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
    readonly plural: boolean;
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object, object>>;
}

export abstract class FragmentWrapper<TFragmentName extends string, E extends string, T extends object, TUnresolvedVariables extends object> {

    protected constructor(readonly name: TFragmentName, readonly fetcher: Fetcher<E, T, TUnresolvedVariables>) {}
}

interface Result {
    readonly text: string;
    readonly fragmentText: string;
    readonly explicitVariableMap: ReadonlyMap<string, string>;
    readonly implicitVariableMap: ReadonlyMap<string, string>;
}

class ResultContext {

    readonly namedFragmentMap = new Map<string, Fetcher<string, object, object>>();

    readonly explicitVariableMap: Map<string, string>;

    readonly implicitVariableMap: Map<string, string>;

    constructor(
        readonly writer: TextWriter = new TextWriter(), 
        ctx?: ResultContext
    ) {
        this.explicitVariableMap = ctx?.explicitVariableMap ?? new Map<string, string>();
        this.implicitVariableMap = ctx?.implicitVariableMap ?? new Map<string, string>();
    }

    accept(fetcher: Fetcher<string, object, object>) {
        
        const t = this.writer.text.bind(this.writer);

        for (const [fieldName, field] of fetcher.fieldMap) {
            t(fieldName);
            if (field.args !== undefined && Object.keys(field).length !== 0) {
                this.writer.scope({type: "ARGUMENTS", multiLines: isMultLineJSON(field.args)}, () => {
                    for (const argName in field.args) {
                        this.writer.seperator();
                        const arg = field.args[argName];
                        t(argName);
                        t(": ");
                        if (arg instanceof ParameterRef) {
                            this.explicitVariableMap.set(arg.name, field.argGraphQLTypes![argName]!);
                            t(arg.name);
                        } else {
                            const text = `__implicitArgs__[${this.implicitVariableMap.size}]`; 
                            t(text);
                            this.implicitVariableMap.set(text, fetcher.fetchableType.fields.get(fieldName)!.argGraphQLTypeMap.get(argName)!);
                        }
                    }
                });
            }
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