export interface Fetchable {}

export interface Fetcher<A, T extends object> {

    __supressWarnings__(source: A, value: T): never;

    toString(): string; // for query/mutation

    toJSON(): string; // for recoil
}

export type ModelType<F> = 
    F extends Fetcher<unknown, infer M> ? 
    M : 
    never;

export abstract class AbstractFetcher<A, T extends object> implements Fetcher<A, T> {

    private _str?: string;

    private _json?: string;

    constructor(
        private _prev: AbstractFetcher<unknown, any> | undefined,
        private _negative: boolean,
        private _field: string,
        private _args?: {[key: string]: any},
        private _child?: AbstractFetcher<unknown, any>
    ) {}

    protected addField<F extends AbstractFetcher<unknown, any>>(
        field: string, 
        args?: {[key: string]: any},
        child?: AbstractFetcher<unknown, any>
    ): F {
        return this.createFetcher(
            this,
            false,
            field,
            args,
            child
        ) as F;
    }

    protected removeField<F extends AbstractFetcher<unknown, any>>(field: string): F {
        return this.createFetcher(
            this,
            true,
            field
        ) as F;
    }

    protected abstract createFetcher(
        prev: AbstractFetcher<unknown, any> | undefined,
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<unknown, any>
    ): AbstractFetcher<unknown, any>;

    toString(): string {
        let s = this._str;
        if (s === undefined) {
            this._str = s = this._toString0(0);
        }
        return s;
    }

    private _toString0(indent: number): string {
        const fieldMap = this._getFieldMap();
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
        const fieldMap = this._getFieldMap();
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

    private _getFieldMap(): Map<string, Field> {
        const fetchers: AbstractFetcher<unknown, any>[] = [];
        for (let fetcher: AbstractFetcher<unknown, any> | undefined = this; 
            fetcher !== undefined; 
            fetcher = fetcher._prev
        ) {
            if (fetcher._field !== "") {
                fetchers.push(fetcher);
            }
        }
        const fieldMap = new Map<string, Field>();
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
    
    private static appendFieldTo(indent: number, fieldName: string, field: Field, targetStr: Ref<string>) {
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
                    targetStr += arg;
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

    __supressWarnings__(_1: A, _2: T): never {
        throw new Error("__supressWarnings is not supported");
    }
}

interface Field {
    readonly args?: {[key: string]: any};
    readonly child?: AbstractFetcher<unknown, any>;
}

interface Ref<T> {
    value: T;
}
