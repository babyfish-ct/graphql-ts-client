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

export type ModelType<F> = 
    F extends Fetcher<string, infer M> ? 
    M : 
    never;

export abstract class AbstractFetcher<E extends string, T extends object> implements Fetcher<E, T> {

    private _str?: string;

    private _json?: string;

    private _fieldMap?: Map<string, FetcherField>;

    constructor(
        readonly fetchedEntityType: E,
        private _prev: AbstractFetcher<string, any> | undefined,
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<string, any>
    ) {
        if (_prev !== undefined && _prev.fetchedEntityType !== fetchedEntityType) {
            throw new Error("prev fetch has bad fetchable");
        }
    }

    protected addField<F extends AbstractFetcher<string, any>>(
        field: string, 
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, any>
    ): F {
        return this.createFetcher(
            this,
            false,
            field,
            args,
            child
        ) as F;
    }

    protected removeField<F extends AbstractFetcher<string, any>>(field: string): F {
        return this.createFetcher(
            this,
            true,
            field
        ) as F;
    }

    protected abstract createFetcher(
        prev: AbstractFetcher<string, any> | undefined,
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, any>
    ): AbstractFetcher<string, any>;

    toString(): string {
        let s = this._str;
        if (s === undefined) {
            this._str = s = this._toString0(0);
        }
        return s;
    }

    private _toString0(indent: number): string {
        const fieldMap = this.fieldMap;
        if (fieldMap.size === 0) {
            return "";
        }
        const resultRef: Ref<string> = { value: ""};
        resultRef.value += "{\n";
        for (const [fieldName, field] of fieldMap) {
            AbstractFetcher.appendIndentTo(indent + 1, resultRef);
            AbstractFetcher.appendFieldTo(indent + 1, fieldName, field, resultRef);
        }
        AbstractFetcher.appendIndentTo(indent, resultRef);
        resultRef.value += "}";
        return resultRef.value;
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
                child: field.child?._toJSON0() 
            };
            arr.push(obj);
        }
        return arr;
    }

    get fieldMap(): Map<string, FetcherField> {
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
            if (fetcher._negative) {
                fieldMap.delete(fetcher._field);
            } else {
                fieldMap.set(fetcher._field, { 
                    args: fetcher._args, 
                    child: fetcher._child 
                });
            }
        }
        return fieldMap;
    }

    private static appendIndentTo(indent: number, targetStr: Ref<string>) {
        for (let i = indent; i > 0; --i) {
            targetStr.value += '\t';
        }
    }
    
    private static appendFieldTo(
        indent: number, 
        fieldName: string, 
        field: FetcherField, 
        targetStr: Ref<string>
    ) {
        targetStr.value += fieldName;
        if (field.args !== undefined) {
            const argNames = Object.keys(field.args);
            if(argNames.length !== 0) {
                let separator = "(";
                for (const argName of argNames) {
                    targetStr.value += separator;
                    targetStr.value += argName;
                    targetStr.value += ": ";
                    const arg = field.args[argName];
                    if (arg === undefined || arg === null) {
                        targetStr.value += "null";
                    } else if (typeof arg === 'number' || typeof arg === 'boolean') {
                        targetStr.value += arg;
                    } else {
                        targetStr.value += '"';
                        targetStr.value += arg;
                        targetStr.value += '"';
                    }
                    separator = ", ";
                }
                targetStr.value += ")";
            }
        }
        if (field.child !== undefined) {
            const childStr = field.child._toString0(indent);
            if (childStr !== "") {
                targetStr.value += " ";
                targetStr.value += childStr;
            }
        }
        targetStr.value += "\n";
    }

    __supressWarnings__(_: T): never {
        throw new Error("__supressWarnings is not supported");
    }
}

interface FetcherField {
    readonly args?: {[key: string]: any};
    readonly child?: AbstractFetcher<string, any>;
}

interface Ref<T> {
    value: T;
}
