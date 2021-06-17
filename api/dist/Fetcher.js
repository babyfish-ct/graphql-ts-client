"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractFetcher = void 0;
class AbstractFetcher {
    constructor(prev, negative, field, args, child) {
        this.prev = prev;
        this.negative = negative;
        this.field = field;
        this.args = args;
        this.child = child;
    }
    addField(field, args, child) {
        return this.createFetcher(this, false, field, args, child);
    }
    removeField(field) {
        return this.createFetcher(this, true, field);
    }
    toString() {
        let s = this.str;
        if (s === undefined) {
            this.str = s = this.toString0(0);
        }
        return s;
    }
    toString0(indent) {
        const fetchers = [];
        for (let AbstractFetcher = this; AbstractFetcher !== undefined; AbstractFetcher = AbstractFetcher.prev) {
            if (AbstractFetcher.field !== "") {
                fetchers.push(AbstractFetcher);
            }
        }
        if (fetchers.length === 0) {
            return "";
        }
        const fieldMap = {};
        for (let i = fetchers.length - 1; i >= 0; --i) {
            const AbstractFetcher = fetchers[i];
            if (AbstractFetcher.negative) {
                delete fieldMap[AbstractFetcher.field];
            }
            else {
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
        const resultRef = { value: "" };
        resultRef.value += "{\n";
        for (const fieldName of fieldNames) {
            const field = fieldMap[fieldName];
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
            const childStr = field.child.toString0(indent);
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
