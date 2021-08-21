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
const Parameter_1 = require("./Parameter");
const TextWriter_1 = require("./TextWriter");
class AbstractFetcher {
    constructor(ctx, _negative, _field, _args, _child) {
        this._negative = _negative;
        this._field = _field;
        this._args = _args;
        this._child = _child;
        if (Array.isArray(ctx)) {
            this._fetchableType = ctx[0];
            this._unionItemTypes = ctx[1] !== undefined && ctx[1].length !== 0 ? ctx[1] : undefined;
        }
        else {
            this._fetchableType = ctx._fetchableType;
            this._unionItemTypes = ctx._unionItemTypes;
            this._prev = ctx;
        }
    }
    get fetchableType() {
        return this._fetchableType;
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
    addEmbbeddable(child, fragmentName) {
        let fieldName;
        if (fragmentName !== undefined) {
            if (fragmentName.length === 0) {
                throw new Error("fragmentName cannot be ''");
            }
            if (fragmentName.startsWith("on ")) {
                throw new Error("fragmentName cannot start with 'on '");
            }
            fieldName = `... ${fragmentName}`;
        }
        else if (child._fetchableType.entityName === this._fetchableType.entityName || child._unionItemTypes !== undefined) {
            fieldName = '...';
        }
        else {
            fieldName = `... on ${child._fetchableType.entityName}`;
        }
        return this.createFetcher(false, fieldName, undefined, child);
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
                    fieldMap.set(fetcher._field, { childFetchers }); // Fragment cause mutliple child fetchers
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
                        childFetchers: fetcher._child === undefined ? undefined : [fetcher._child] // Association only cause one child fetcher
                    });
                }
            }
        }
        return fieldMap;
    }
    toString() {
        return this.result.text;
    }
    toFragmentString() {
        return this.result.fragmentText;
    }
    toJSON() {
        return JSON.stringify(this.result);
    }
    get result() {
        let r = this._result;
        if (r === undefined) {
            this._result = r = this.createResult();
        }
        return r;
    }
    createResult() {
        const writer = new TextWriter_1.TextWriter();
        const fragmentWriter = new TextWriter_1.TextWriter();
        let ctx = new ResultContext(writer);
        ctx.accept(this);
        const renderedFragmentNames = new Set();
        while (true) {
            const fragmentMap = ctx.namedFragmentMap;
            if (fragmentMap === undefined) {
                break;
            }
            const fragmentCtx = new ResultContext(fragmentWriter, ctx);
            for (const [fragmentName, fragment] of fragmentMap) {
                if (renderedFragmentNames.add(fragmentName)) {
                    fragmentWriter.text(`fragment ${fragmentName} on ${fragment.fetchableType.entityName} `);
                    fragmentCtx.accept(fragment);
                }
            }
        }
        return {
            text: writer.toString(),
            fragmentText: writer.toString(),
            explicitArgumentNames: ctx.explicitArgumentNames,
            implicitArgumentValues: ctx.implicitArgumentValues
        };
    }
    __supressWarnings__(_) {
        throw new Error("__supressWarnings is not supported");
    }
}
exports.AbstractFetcher = AbstractFetcher;
class ResultContext {
    constructor(writer = new TextWriter_1.TextWriter(), ctx) {
        var _a, _b;
        this.writer = writer;
        this._namedFragmentMap = new Map();
        this.explicitArgumentNames = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.explicitArgumentNames) !== null && _a !== void 0 ? _a : new Set();
        this.implicitArgumentValues = (_b = ctx === null || ctx === void 0 ? void 0 : ctx.implicitArgumentValues) !== null && _b !== void 0 ? _b : [];
    }
    accept(fetcher) {
        const t = this.writer.text.bind(this.writer);
        this.writer.scope({ type: "BLOCK", multiLines: true }, () => {
            for (const [fieldName, field] of fetcher.fieldMap) {
                t(fieldName);
                if (field.args !== undefined && Object.keys(field).length !== 0) {
                    this.writer.scope({ type: "ARGUMENTS", multiLines: isMultLineJSON(field.args) }, () => {
                        for (const argName in field.args) {
                            this.writer.seperator();
                            const arg = field.args[argName];
                            t(argName);
                            t(": ");
                            if (arg instanceof Parameter_1.ParameterRef) {
                                this.explicitArgumentNames.add(arg.name);
                                t(arg.name);
                            }
                            else {
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
                        const oldFragment = this._namedFragmentMap.get(fragmentName);
                        for (const childFetcher of childFetchers) {
                            if (oldFragment !== undefined && oldFragment !== childFetcher) {
                                throw new Error(`Conflict fragment name ${fragmentName}`);
                            }
                            this._namedFragmentMap.set(fragmentName, childFetcher);
                        }
                    }
                    else {
                        t(' ');
                        for (const childFetcher of childFetchers) {
                            this.accept(childFetcher);
                        }
                    }
                }
            }
        });
        t("\n");
    }
    get namedFragmentMap() {
        if (this._namedFragmentMap.size === 0) {
            return undefined;
        }
        return this._namedFragmentMap;
    }
}
function isMultLineJSON(obj) {
    let size = 0;
    if (Array.isArray(obj)) {
        for (const value of obj) {
            if (typeof value === 'object' && !(value instanceof Parameter_1.ParameterRef)) {
                return true;
            }
            if (++size > 2) {
                return true;
            }
        }
    }
    else if (typeof obj === 'object') {
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'object' && !(value instanceof Parameter_1.ParameterRef)) {
                return true;
            }
            if (++size > 2) {
                return true;
            }
        }
    }
    return false;
}
