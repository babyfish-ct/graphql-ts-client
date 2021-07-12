"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractFetcher = void 0;
class AbstractFetcher {
    constructor(fetchedEntityType, _prev, _negative, _field, _args, _child) {
        this.fetchedEntityType = fetchedEntityType;
        this._prev = _prev;
        this._negative = _negative;
        this._field = _field;
        this._args = _args;
        this._child = _child;
        if (_prev !== undefined && _prev.fetchedEntityType !== fetchedEntityType) {
            throw new Error("prev fetch has bad fetchable");
        }
    }
    addField(field, args, child) {
        return this.createFetcher(this, false, field, args, child);
    }
    removeField(field) {
        return this.createFetcher(this, true, field);
    }
    toString() {
        let s = this._str;
        if (s === undefined) {
            this._str = s = this._toString0(0);
        }
        return s;
    }
    _toString0(indent) {
        const fieldMap = this.fieldMap;
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
    toJSON() {
        let j = this._json;
        if (j === undefined) {
            this._json = j = JSON.stringify(this._toJSON0());
        }
        return j;
    }
    _toJSON0() {
        var _a;
        const fieldMap = this.fieldMap;
        if (fieldMap.size === 0) {
            return {};
        }
        const arr = [];
        for (const [name, field] of fieldMap) {
            let obj = {
                name,
                args: field.args,
                child: (_a = field.child) === null || _a === void 0 ? void 0 : _a._toJSON0()
            };
            arr.push(obj);
        }
        return arr;
    }
    get fieldMap() {
        let m = this._fieldMap;
        if (m === undefined) {
            this._fieldMap = m = this._getFieldMap0();
        }
        return m;
    }
    _getFieldMap0() {
        const fetchers = [];
        for (let fetcher = this; fetcher !== undefined; fetcher = fetcher._prev) {
            if (fetcher._field !== "") {
                fetchers.push(fetcher);
            }
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
        return fieldMap;
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
                    if (arg === undefined || arg === null) {
                        targetStr.value += "null";
                    }
                    else if (typeof arg === 'number' || typeof arg === 'boolean') {
                        targetStr.value += arg;
                    }
                    else {
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
    __supressWarnings__(_) {
        throw new Error("__supressWarnings is not supported");
    }
}
exports.AbstractFetcher = AbstractFetcher;
