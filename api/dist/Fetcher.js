"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractFetcher = void 0;
class AbstractFetcher {
    constructor(_prev, _negative, _field, _args, _child) {
        this._prev = _prev;
        this._negative = _negative;
        this._field = _field;
        this._args = _args;
        this._child = _child;
    }
    addField(field, args, child) {
        return this.createFetcher(this, false, field, args, child);
    }
    removeField(field) {
        return this.createFetcher(this, true, field);
    }
    get graphql() {
        let s = this.str;
        if (s === undefined) {
            this.str = s = this.graphql0(0);
        }
        return s;
    }
    graphql0(indent) {
        const fetchers = [];
        for (let fetcher = this; fetcher !== undefined; fetcher = fetcher._prev) {
            if (fetcher._field !== "") {
                fetchers.push(fetcher);
            }
        }
        if (fetchers.length === 0) {
            return "";
        }
        const fieldMap = new Map();
        for (let i = fetchers.length - 1; i >= 0; --i) {
            const fetcher = fetchers[i];
            if (fetcher._negative) {
                fieldMap.delete(fetcher._field);
            }
            else {
                fieldMap.set(fetcher._field, {
                    args: fetcher._args,
                    child: fetcher._child
                });
            }
        }
        if (fieldMap.size === 0) {
            return "";
        }
        const resultRef = { value: "" };
        resultRef.value += "{\n";
        for (const [fieldName, field] of fieldMap) {
            AbstractFetcher.appendIndentTo(indent + 1, resultRef);
            AbstractFetcher.appendFieldTo(indent + 1, fieldName, field, resultRef);
        }
        AbstractFetcher.appendIndentTo(indent, resultRef);
        resultRef.value += "}";
        return resultRef.value;
    }
    static appendIndentTo(indent, targetStr) {
        for (let i = indent; i > 0; --i) {
            targetStr.value += '\t';
        }
    }
    static appendFieldTo(indent, fieldName, field, targetStr) {
        targetStr.value += fieldName;
        if (field.args !== undefined) {
            const argNames = Object.keys(field.args);
            if (argNames.length !== 0) {
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
            const childStr = field.child.graphql0(indent);
            if (childStr !== "") {
                targetStr.value += " ";
                targetStr.value += childStr;
            }
        }
        targetStr.value += "\n";
    }
    __supressWarnings__(value) {
        throw new Error("__supressWarnings is not supported");
    }
}
exports.AbstractFetcher = AbstractFetcher;
