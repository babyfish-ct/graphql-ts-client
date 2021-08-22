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

 export interface Fetcher<E extends string, T extends object> {

    readonly fetchableType: FetchableType<E>;

    readonly fieldMap: ReadonlyMap<string, FetcherField>;

    toString(): string;

    toFragmentString(): string;

    toJSON(): string; // for recoil

    __supressWarnings__(value: T): never;
}

export type ModelType<F> = 
    F extends Fetcher<string, infer M> ? 
    M : 
    never;

export abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {

    private _fetchableType: FetchableType<E>;

    private _unionItemTypes?: string[];

    private _prev?: AbstractFetcher<string, any>;

    private _fieldMap?: Map<string, FetcherField>;

    private _result: Result;    

    constructor(
        ctx: AbstractFetcher<string, any> | [FetchableType<E>, string[] | undefined],
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<string, any>
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

    protected addField<F extends AbstractFetcher<string, any>>(
        field: string, 
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, any>
    ): F {
        return this.createFetcher(
            false,
            field,
            args,
            child
        ) as F;
    }

    protected removeField<F extends AbstractFetcher<string, any>>(field: string): F {
        if (field === '__typename') {
            throw new Error("__typename cannot be removed");
        }
        return this.createFetcher(
            true,
            field
        ) as F;
    }

    protected addEmbbeddable<F extends AbstractFetcher<string, any>>(
        child: AbstractFetcher<string, any>,
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
        child?: AbstractFetcher<string, any>
    ): AbstractFetcher<string, any>;

    get fieldMap(): ReadonlyMap<string, FetcherField> {
        let m = this._fieldMap;
        if (m === undefined) {
            this._fieldMap = m = this._getFieldMap0();
        }
        return m;
    }

    private _getFieldMap0(): Map<string, FetcherField> {
        const fetchers: AbstractFetcher<string, any>[] = [];
        for (let fetcher: AbstractFetcher<string, any> | undefined = this; 
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
                let childFetchers = fieldMap.get(fetcher._field)?.childFetchers as AbstractFetcher<string, any>[];
                if (childFetchers === undefined) {
                    childFetchers = [];
                    fieldMap.set(fetcher._field, { childFetchers }); // Fragment cause mutliple child fetchers
                }
                childFetchers.push(fetcher._child!);
            } else {
                if (fetcher._negative) {
                    fieldMap.delete(fetcher._field);
                } else {
                    fieldMap.set(fetcher._field, { 
                        args: fetcher._args, 
                        childFetchers: fetcher._child === undefined ? undefined: [fetcher._child] // Association only cause one child fetcher
                    });
                }
            }
        }
        return fieldMap;
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
            explicitArgumentNames: ctx.explicitArgumentNames,
            implicitArgumentValues: ctx.implicitArgumentValues
        };
    }

    __supressWarnings__(_: T): never {
        throw new Error("__supressWarnings is not supported");
    }
}

export interface FetchableType<E extends string> {
    readonly entityName: E;
    readonly superTypes: readonly FetchableType<string>[];
    readonly declaredFields: ReadonlySet<string>;
    readonly fields: ReadonlySet<string>;
}

export interface FetcherField {
    readonly args?: {readonly [key: string]: any};
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, object>>;
}

export abstract class FragmentWrapper<TFragmentName extends string, E extends string, T extends object> {

    protected constructor(readonly name: TFragmentName, readonly fetcher: Fetcher<E, T>) {}
}

interface Result {
    readonly text: string;
    readonly fragmentText: string;
    readonly explicitArgumentNames: ReadonlySet<string>;
    readonly implicitArgumentValues: readonly any[];
}

class ResultContext {

    readonly namedFragmentMap = new Map<string, Fetcher<string, any>>();

    readonly explicitArgumentNames: Set<string>;

    readonly implicitArgumentValues: any[];

    constructor(
        readonly writer: TextWriter = new TextWriter(), 
        ctx?: ResultContext
    ) {
        this.explicitArgumentNames = ctx?.explicitArgumentNames ?? new Set<string>();
        this.implicitArgumentValues = ctx?.implicitArgumentValues ?? [];
    }

    accept(fetcher: Fetcher<string, object>) {
        
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
                            this.explicitArgumentNames.add(arg.name);
                            t(arg.name);
                        } else {
                            t(`fetcherArgs[${this.implicitArgumentValues.length}]`);
                            this.implicitArgumentValues.push(arg);
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