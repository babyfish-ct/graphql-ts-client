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
    constructor(ctx, _negative, _field, _args, _child, _fragmentName) {
        this._negative = _negative;
        this._field = _field;
        this._args = _args;
        this._child = _child;
        this._fragmentName = _fragmentName;
        if (Array.isArray(ctx)) {
            this._fetchedEntityType = ctx[0];
            this._unionItemTypes = ctx[1] !== undefined && ctx[1].length !== 0 ? ctx[1] : undefined;
        }
        else {
            this._fetchedEntityType = ctx._fetchedEntityType;
            this._unionItemTypes = ctx._unionItemTypes;
            this._prev = ctx;
        }
    }
    get fetchedEntityType() {
        return this._fetchedEntityType;
    }
    addField(field, args, child) {
        return this.createFetcher(false, field, args, child);
    }
    removeField(field) {
        if (field === '__typename') {
            throw new Error("__typename cannot be removed");
        }
        return this.createFetcher(true, field);
    }
    addEmbbeddable(child) {
        let fieldName;
        if (child._fragmentName !== undefined) {
            fieldName = `... ${child._fragmentName}`;
        }
        else if (child._fetchedEntityType === this._fetchedEntityType || child._unionItemTypes !== undefined) {
            fieldName = '...';
        }
        else {
            fieldName = `... on ${child._fetchedEntityType}`;
        }
        return this.createFetcher(false, fieldName, undefined, child);
    }
    addFragment(name) {
        if (this._unionItemTypes !== undefined) {
            throw new Error("Cannot cast the fetcher of union type to fragment");
        }
        return this.createFetcher(false, "", undefined, undefined, name);
    }
    toString() {
        let s = this._str;
        if (s === undefined) {
            const result = this._toString0(0);
            this._str = s = result[0];
            this._fragmentStr = result[1];
        }
        return s;
    }
    toFragmentString() {
        let fs = this._fragmentStr;
        if (fs === undefined) {
            const result = this._toString0(0);
            this._str = result[0];
            this._fragmentStr = fs = result[1];
        }
        return fs;
    }
    _toString0(indent) {
        const ctx = {
            value: "",
            fragmentMap: new Map()
        };
        this._toString1(indent, ctx);
        const processedFragmentNames = new Set();
        let fragmentStr = "";
        let restFragmentMap = ctx.fragmentMap;
        while (restFragmentMap.size !== 0) {
            const fragmentCtx = {
                value: "",
                fragmentMap: new Map()
            };
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
    _toString1(indent, ctx) {
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
        }
        else {
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
                child: (_a = field.childFetchers) === null || _a === void 0 ? void 0 : _a.map(child => child._toJSON0())
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
        var _a;
        const fetchers = [];
        for (let fetcher = this; fetcher !== undefined; fetcher = fetcher._prev) {
            if (fetcher._field !== "") {
                fetchers.push(fetcher);
            }
        }
        const fieldMap = new Map();
        for (let i = fetchers.length - 1; i >= 0; --i) {
            const fetcher = fetchers[i];
            if (fetcher._field.startsWith('...')) {
                let childFetchers = (_a = fieldMap.get(fetcher._field)) === null || _a === void 0 ? void 0 : _a.childFetchers;
                if (childFetchers === undefined) {
                    childFetchers = [];
                    fieldMap.set(fetcher._field, { childFetchers });
                }
                childFetchers.push(fetcher._child);
            }
            else {
                if (fetcher._negative) {
                    fieldMap.delete(fetcher._field);
                }
                else {
                    fieldMap.set(fetcher._field, {
                        args: fetcher._args,
                        childFetchers: fetcher._child === undefined ? undefined : [fetcher._child]
                    });
                }
            }
        }
        return fieldMap;
    }
    static appendIndentTo(indent, ctx) {
        for (let i = indent; i > 0; --i) {
            ctx.value += '\t';
        }
    }
    static appendFieldTo(indent, fieldName, field, ctx) {
        if (field.childFetchers !== undefined) {
            for (const child of field.childFetchers) {
                this._appendFieldTo0(indent, fieldName, field, ctx, child);
            }
        }
        else {
            this._appendFieldTo0(indent, fieldName, field, ctx);
        }
    }
    static _appendFieldTo0(indent, fieldName, field, ctx, child) {
        ctx.value += fieldName;
        if (field.args !== undefined) {
            const argNames = Object.keys(field.args);
            if (argNames.length !== 0) {
                let separator = "(";
                for (const argName of argNames) {
                    ctx.value += separator;
                    ctx.value += argName;
                    ctx.value += ": ";
                    const arg = field.args[argName];
                    if (arg === undefined || arg === null) {
                        ctx.value += "null";
                    }
                    else if (typeof arg === 'number' || typeof arg === 'boolean') {
                        ctx.value += arg;
                    }
                    else {
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
            if (child._fragmentName !== undefined) {
                const conflictFragment = ctx.fragmentMap.get(child._fragmentName);
                if (conflictFragment === undefined) {
                    ctx.fragmentMap.set(child._fragmentName, child);
                }
                else if (conflictFragment !== child) {
                    throw new Error(`Different fragments with same name '${child._fragmentName}'`);
                }
            }
            else {
                const childCtx = {
                    value: "",
                    fragmentMap: ctx.fragmentMap
                };
                child._toString1(indent, childCtx);
                if (childCtx.value !== "") {
                    ctx.value += " ";
                    ctx.value += childCtx.value;
                }
            }
        }
        ctx.value += "\n";
    }
    __supressWarnings__(_) {
        throw new Error("__supressWarnings is not supported");
    }
}
exports.AbstractFetcher = AbstractFetcher;
