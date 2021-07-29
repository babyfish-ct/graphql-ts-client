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

export type ModelType<F> = 
    F extends Fetcher<string, infer M> ? 
    M : 
    never;

export abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {

    private _fetchedEntityType: E;

    private _unionItemTypes?: string[];

    private _prev?: AbstractFetcher<string, any>;

    private _str?: string;

    private _fragmentStr?: string;

    private _json?: string;

    private _fieldMap?: Map<string, FetcherField>;

    constructor(
        ctx: AbstractFetcher<string, any> | [E, string[] | undefined],
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<string, any>,
        private _fragmentName?: string
    ) {
        if (Array.isArray(ctx)) {
            this._fetchedEntityType = ctx[0];
            this._unionItemTypes = ctx[1] !== undefined && ctx[1].length !== 0 ? ctx[1] : undefined;
        } else {
            this._fetchedEntityType = ctx._fetchedEntityType as E;
            this._unionItemTypes = ctx._unionItemTypes;
            this._prev = ctx;
        }
    }

    get fetchedEntityType(): E {
        return this._fetchedEntityType;
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
        child: AbstractFetcher<string, any>
    ) {
        let fieldName: string;
        if (child._fragmentName !== undefined) {
            fieldName = `... ${child._fragmentName}`;
        } else if (child._fetchedEntityType === this._fetchedEntityType || child._unionItemTypes !== undefined) {
            fieldName = '...';
        } else {
            fieldName = `... on ${child._fetchedEntityType}`;
        }
        return this.createFetcher(
            false,
            fieldName,
            undefined,
            child
        ) as F;
    }

    protected addFragment(name: string): Fetcher<E, T> {
        if (this._unionItemTypes !== undefined) {
            throw new Error("Cannot cast the fetcher of union type to fragment");
        }
        return this.createFetcher(
            false,
            "",
            undefined,
            undefined,
            name
        ) as any as Fetcher<E, T>;
    }

    protected abstract createFetcher(
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, any>,
        fragmentName?: string
    ): AbstractFetcher<string, any>;

    toString(): string {
        let s = this._str;
        if (s === undefined) {
            const result = this._toString0(0);
            this._str = s = result[0];
            this._fragmentStr = result[1];
        }
        return s;
    }

    toFragmentString(): string {
        let fs = this._fragmentStr;
        if (fs === undefined) {
            const result = this._toString0(0);
            this._str = result[0];
            this._fragmentStr = fs = result[1];
        }
        return fs;
    }

    private _toString0(indent: number): [string, string] {
        const ctx: ToStringContext = { 
            value: "",
            fragmentMap: new Map<string, AbstractFetcher<string, any>>()
        };
        this._toString1(indent, ctx);

        const processedFragmentNames = new Set<string>();
        let fragmentStr = "";
        let restFragmentMap = ctx.fragmentMap;
        while (restFragmentMap.size !== 0) {
            const fragmentCtx: ToStringContext = {
                value: "",
                fragmentMap: new Map<string, AbstractFetcher<string, any>>()
            }
            for (const [name, fragmentFetcher] of restFragmentMap) {
                if (!processedFragmentNames.has(name)) {
                    processedFragmentNames.add(name);
                    fragmentCtx.value += "\nfragment ";
                    fragmentCtx.value += name;
                    fragmentCtx.value += " on ";
                    fragmentCtx.value += fragmentFetcher._fetchedEntityType;
                    fragmentCtx.value += " ";
                    fragmentFetcher._toString1(0, fragmentCtx);
                }
            }
            fragmentStr += fragmentCtx.value;
            restFragmentMap = fragmentCtx.fragmentMap;
        }
        return [ctx.value, fragmentStr];
    }

    private _toString1(indent: number, ctx: ToStringContext) {
        const fieldMap = this.fieldMap;
        if (fieldMap.size === 0) {
            return ["", ""];
        }
        
        ctx.value += "{\n";
        if (this._unionItemTypes === undefined) {
            for (const [fieldName, field] of fieldMap) {
                AbstractFetcher.appendIndentTo(indent + 1, ctx);
                AbstractFetcher.appendFieldTo(indent + 1, fieldName, field, ctx);
            }
        } else {
            for (const [fieldName, field] of fieldMap) {
                if (fieldName.startsWith("...")) {
                    AbstractFetcher.appendIndentTo(indent + 1, ctx);
                    AbstractFetcher.appendFieldTo(indent + 1, fieldName, field, ctx);
                }
            }
            for (const itemType of this._unionItemTypes) {
                AbstractFetcher.appendIndentTo(indent + 1, ctx);
                ctx.value += "... on ";
                ctx.value += itemType;
                ctx.value += " { \n";
                for (const [fieldName, field] of fieldMap) {
                    if (!fieldName.startsWith("...")) {
                        AbstractFetcher.appendIndentTo(indent + 2, ctx);
                        AbstractFetcher.appendFieldTo(indent + 2, fieldName, field, ctx);
                    }
                }
                AbstractFetcher.appendIndentTo(indent + 1, ctx);
                ctx.value += "}\n";
            }
        }
        AbstractFetcher.appendIndentTo(indent, ctx);
        ctx.value += "}";
    }

    toJSON(): string {
        let j = this._json;
        if (j === undefined) {
            this._json = j = JSON.stringify(this._toJSON0());
        }
        return j;
    }

    private _toJSON0(): object {
        const fieldMap = this.fieldMap;
        if (fieldMap.size === 0) {
            return {};
        }
        const arr = [];
        for (const [name, field] of fieldMap) {
            let obj = { 
                name, 
                args: field.args,
                child: field.childFetchers?.map(child => child._toJSON0()) 
            };
            arr.push(obj);
        }
        return arr;
    }

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
                    fieldMap.set(fetcher._field, { childFetchers });
                }
                childFetchers.push(fetcher._child!);
            } else {
                if (fetcher._negative) {
                    fieldMap.delete(fetcher._field);
                } else {
                    fieldMap.set(fetcher._field, { 
                        args: fetcher._args, 
                        childFetchers: fetcher._child === undefined ? undefined: [fetcher._child]
                    });
                }
            }
        }
        return fieldMap;
    }

    private static appendIndentTo(indent: number, ctx: ToStringContext) {
        for (let i = indent; i > 0; --i) {
            ctx.value += '\t';
        }
    }
    
    private static appendFieldTo(
        indent: number, 
        fieldName: string, 
        field: FetcherField, 
        ctx: ToStringContext
    ) {
        if (field.childFetchers !== undefined) {
            for (const child of field.childFetchers) {
                this._appendFieldTo0(
                    indent,
                    fieldName,
                    field,
                    ctx,
                    child
                );
            }
        } else {
            this._appendFieldTo0(
                indent,
                fieldName,
                field,
                ctx
            );
        }
    }

    private static _appendFieldTo0(
        indent: number, 
        fieldName: string, 
        field: FetcherField, 
        ctx: ToStringContext,
        child?: AbstractFetcher<string, any>
    ) {
        ctx.value += fieldName;
        if (field.args !== undefined) {
            const argNames = Object.keys(field.args);
            if(argNames.length !== 0) {
                let separator = "(";
                for (const argName of argNames) {
                    ctx.value += separator;
                    ctx.value += argName;
                    ctx.value += ": ";
                    const arg = field.args[argName];
                    if (arg === undefined || arg === null) {
                        ctx.value += "null";
                    } else if (typeof arg === 'number' || typeof arg === 'boolean') {
                        ctx.value += arg;
                    } else {
                        ctx.value += '"';
                        ctx.value += arg;
                        ctx.value += '"';
                    }
                    separator = ", ";
                }
                ctx.value += ")";
            }
        }
        if (child !== undefined) {
            if(child._fragmentName !== undefined) {
                const conflictFragment = ctx.fragmentMap.get(child._fragmentName);
                if (conflictFragment === undefined) {
                    ctx.fragmentMap.set(child._fragmentName, child);
                } else if (conflictFragment !== child) {
                    throw new Error(`Different fragments with same name '${child._fragmentName}'`);
                }
            } else {
                const childCtx: ToStringContext = {
                    value: "",
                    fragmentMap: ctx.fragmentMap
                }
                child._toString1(indent, childCtx);
                if (childCtx.value !== "") {
                    ctx.value += " ";
                    ctx.value += childCtx.value;
                }
            }
        }
        ctx.value += "\n";
    }

    __supressWarnings__(_: T): never {
        throw new Error("__supressWarnings is not supported");
    }
}

export interface FetcherField {
    readonly args?: {readonly [key: string]: any};
    readonly childFetchers?: ReadonlyArray<AbstractFetcher<string, any>>;
}

interface ToStringContext {
    value: string;
    readonly fragmentMap: Map<string, AbstractFetcher<string, any>>;
}
