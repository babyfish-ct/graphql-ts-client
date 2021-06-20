export interface Fetcher<T extends object> {
    __supressWarnings__(value: T): never;
}

export type ModelType<F> = 
    F extends Fetcher<infer M> ? 
    M : 
    never;

export abstract class AbstractFetcher<T extends object> implements Fetcher<T> {

    private str?: string;

    constructor(
        private prev: AbstractFetcher<any> | undefined,
        private negative: boolean,
        private field: string,
        private args?: {[key: string]: any},
        private child?: AbstractFetcher<any>
    ) {}

    protected addField<F extends AbstractFetcher<any>>(
        field: string, 
        args?: {[key: string]: any},
        child?: AbstractFetcher<any>
    ): F {
        return this.createFetcher(
            this,
            false,
            field,
            args,
            child
        ) as F;
    }

    protected removeField<F extends AbstractFetcher<any>>(field: string): F {
        return this.createFetcher(
            this,
            true,
            field
        ) as F;
    }

    protected abstract createFetcher(
        prev: AbstractFetcher<any> | undefined,
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<any>
    ): AbstractFetcher<any>;

    toString(): string {
        let s = this.str;
        if (s === undefined) {
            this.str = s = this.toString0(0);
        }
        return s;
    }

    private toString0(indent: number): string {
        const fetchers: AbstractFetcher<any>[] = [];
        for (let AbstractFetcher: AbstractFetcher<any> | undefined = this; 
            AbstractFetcher !== undefined; 
            AbstractFetcher = AbstractFetcher.prev
        ) {
            if (AbstractFetcher.field !== "") {
                fetchers.push(AbstractFetcher);
            }
        }
        if (fetchers.length === 0) {
            return "";
        }
        const fieldMap: {[key: string]: Field} = {};
        for (let i = fetchers.length - 1; i >= 0; --i) {
            const AbstractFetcher = fetchers[i];
            if (AbstractFetcher.negative) {
                delete fieldMap[AbstractFetcher.field];
            } else {
                fieldMap[AbstractFetcher.field] = { 
                    args: AbstractFetcher.args, 
                    child: AbstractFetcher.child 
                };
            }
        }
        const fieldNames = Object.keys(fieldMap);
        if (fieldNames.length === 0) {
            return "";
        }
        const resultRef: Ref<string> = { value: ""};
        resultRef.value += "{\n";
        for (const fieldName of fieldNames) {
            const field = fieldMap[fieldName]!;
            AbstractFetcher.appendIndentTo(indent + 1, resultRef);
            AbstractFetcher.appendFieldTo(indent + 1, fieldName, field, resultRef);
        }
        AbstractFetcher.appendIndentTo(indent, resultRef);
        resultRef.value += "}";
        return resultRef.value;
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
            const childStr = field.child.toString0(indent);
            if (childStr !== "") {
                targetStr.value += " ";
                targetStr.value += childStr;
            }
        }
        targetStr.value += "\n";
    }

    __supressWarnings__(value: T): never {
        throw new Error("__supressWarnings is not supported");
    }
}

interface Field {
    readonly args?: {[key: string]: any};
    readonly child?: AbstractFetcher<any>;
}

interface Ref<T> {
    value: T;
}
