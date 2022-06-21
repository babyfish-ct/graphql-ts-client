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
exports.StringValue = exports.SpreadFragment = exports.AbstractFetcher = void 0;
const TextWriter_1 = require("./TextWriter");
class AbstractFetcher {
    constructor(ctx, _negative, _field, _args, _child, _fieldOptionsValue, _directive, _directiveArgs) {
        this._negative = _negative;
        this._field = _field;
        this._args = _args;
        this._child = _child;
        this._fieldOptionsValue = _fieldOptionsValue;
        this._directive = _directive;
        this._directiveArgs = _directiveArgs;
        if (Array.isArray(ctx)) {
            this._fetchableType = ctx[0];
            this._enumInputMetadata = ctx[1];
            this._unionItemTypes = ctx.length > 2 && ctx[2] !== undefined && ctx[2].length !== 0 ? ctx[2] : undefined;
        }
        else {
            this._fetchableType = ctx._fetchableType;
            this._enumInputMetadata = ctx._enumInputMetadata;
            this._unionItemTypes = ctx._unionItemTypes;
            this._prev = ctx;
        }
    }
    get fetchableType() {
        return this._fetchableType;
    }
    addField(field, args, child, optionsValue) {
        return this.createFetcher(false, field, args, child, optionsValue);
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
        else if (child._fetchableType.name === this._fetchableType.name || child._unionItemTypes !== undefined) {
            fieldName = '...';
        }
        else {
            fieldName = `... on ${child._fetchableType.name}`;
        }
        return this.createFetcher(false, fieldName, undefined, child);
    }
    addDirective(directive, directiveArgs) {
        return this.createFetcher(false, "", undefined, undefined, undefined, directive, directiveArgs);
    }
    get fieldMap() {
        let m = this._fieldMap;
        if (m === undefined) {
            this._fieldMap = m = this._getFieldMap0();
        }
        return m;
    }
    _getFieldMap0() {
        var _a, _b, _c, _d;
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
                    fieldMap.set(fetcher._field, { plural: false, childFetchers }); // Fragment cause mutliple child fetchers
                }
                childFetchers.push(fetcher._child);
            }
            else {
                if (fetcher._negative) {
                    fieldMap.delete(fetcher._field);
                }
                else {
                    fieldMap.set(fetcher._field, {
                        argGraphQLTypes: (_b = fetcher.fetchableType.fields.get(fetcher._field)) === null || _b === void 0 ? void 0 : _b.argGraphQLTypeMap,
                        args: fetcher._args,
                        fieldOptionsValue: fetcher._fieldOptionsValue,
                        plural: (_d = (_c = fetcher.fetchableType.fields.get(fetcher._field)) === null || _c === void 0 ? void 0 : _c.isPlural) !== null && _d !== void 0 ? _d : false,
                        childFetchers: fetcher._child === undefined ? undefined : [fetcher._child] // Association only cause one child fetcher
                    });
                }
            }
        }
        return fieldMap;
    }
    get directiveMap() {
        let map = this._directiveMap;
        if (map === undefined) {
            this._directiveMap = map = this._getDirectiveMap();
        }
        return map;
    }
    _getDirectiveMap() {
        const map = new Map();
        for (let fetcher = this; fetcher !== undefined; fetcher = fetcher._prev) {
            if (fetcher._directive !== undefined) {
                if (!map.has(fetcher._directive)) {
                    map.set(fetcher._directive, fetcher._directiveArgs);
                }
            }
        }
        return map;
    }
    get variableTypeMap() {
        return this.result.variableTypeMap;
    }
    findField(fieldName) {
        const field = this.fieldMap.get(fieldName);
        if (field !== undefined) {
            return field;
        }
        for (const [fieldName, field] of this.fieldMap) {
            if (fieldName.startsWith("...") && field.childFetchers !== undefined) {
                for (const fragmentFetcher of field.childFetchers) {
                    const deeperField = fragmentFetcher.findField(fieldName);
                    if (deeperField !== undefined) {
                        return deeperField;
                    }
                }
            }
        }
        return undefined;
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
        ctx.acceptDirectives(this.directiveMap);
        writer.scope({ type: "BLOCK", multiLines: true, suffix: '\n' }, () => {
            ctx.accept(this);
        });
        const renderedFragmentNames = new Set();
        while (true) {
            const fragmentMap = ctx.namedFragmentMap;
            if (fragmentMap.size === 0) {
                break;
            }
            ctx = new ResultContext(fragmentWriter, ctx);
            for (const [fragmentName, fragment] of fragmentMap) {
                if (renderedFragmentNames.add(fragmentName)) {
                    fragmentWriter.text(`fragment ${fragmentName} on ${fragment.fetchableType.name} `);
                    ctx.acceptDirectives(fragment.directiveMap);
                    fragmentWriter.scope({ type: "BLOCK", multiLines: true, suffix: '\n' }, () => {
                        ctx.accept(fragment);
                    });
                }
            }
        }
        return {
            text: writer.toString(),
            fragmentText: fragmentWriter.toString(),
            variableTypeMap: ctx.variableTypeMap
        };
    }
    " $supressWarnings"(_, _2) {
        throw new Error("' $supressWarnings' is not supported");
    }
}
exports.AbstractFetcher = AbstractFetcher;
class SpreadFragment {
    constructor(name, fetcher) {
        this.name = name;
        this.fetcher = fetcher;
        this[" $__instanceOfSpreadFragment"] = true;
    }
}
exports.SpreadFragment = SpreadFragment;
class StringValue {
    constructor(value, quotationMarks = true) {
        this.value = value;
        this.quotationMarks = quotationMarks;
    }
}
exports.StringValue = StringValue;
class ResultContext {
    constructor(writer = new TextWriter_1.TextWriter(), ctx) {
        var _a;
        this.writer = writer;
        this.namedFragmentMap = new Map();
        this.variableTypeMap = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.variableTypeMap) !== null && _a !== void 0 ? _a : new Map();
    }
    accept(fetcher) {
        var _a, _b;
        const t = this.writer.text.bind(this.writer);
        for (const [fieldName, field] of fetcher.fieldMap) {
            if (fieldName !== "...") { // Inline fragment
                const alias = (_a = field.fieldOptionsValue) === null || _a === void 0 ? void 0 : _a.alias;
                if (alias !== undefined && alias !== "" && alias !== fieldName) {
                    t(`${alias}: `);
                }
                t(fieldName);
                if (field.argGraphQLTypes !== undefined) {
                    const enumInputMedata = fetcher["_enumInputMetadata"];
                    this.acceptArgs(field.args, field.argGraphQLTypes, enumInputMedata);
                }
                this.acceptDirectives((_b = field.fieldOptionsValue) === null || _b === void 0 ? void 0 : _b.directives);
            }
            const childFetchers = field.childFetchers;
            if (childFetchers !== undefined && childFetchers.length !== 0) {
                if (fieldName === "...") {
                    for (const childFetcher of childFetchers) {
                        this.accept(childFetcher);
                    }
                }
                else if (fieldName.startsWith("...") && !fieldName.startsWith("... on ")) {
                    const fragmentName = fieldName.substring("...".length).trim();
                    const oldFragment = this.namedFragmentMap.get(fragmentName);
                    for (const childFetcher of childFetchers) {
                        if (oldFragment !== undefined && oldFragment !== childFetcher) {
                            throw new Error(`Conflict fragment name ${fragmentName}`);
                        }
                        this.namedFragmentMap.set(fragmentName, childFetcher);
                    }
                }
                else {
                    t(' ');
                    this.writer.scope({ type: "BLOCK", multiLines: true }, () => {
                        for (const childFetcher of childFetchers) {
                            this.accept(childFetcher);
                        }
                    });
                }
            }
            t('\n');
        }
    }
    acceptDirectives(directives) {
        if (directives !== undefined) {
            for (const [directive, args] of directives) {
                this.writer.text(`\n@${directive}`);
                this.acceptArgs(args);
            }
        }
    }
    acceptArgs(args, argGraphQLTypeMap, // undefined: directive args; otherwise: field args,
    enumInputMetadata) {
        if (args === undefined) {
            return;
        }
        const t = this.writer.text.bind(this.writer);
        let hasField;
        if (argGraphQLTypeMap !== undefined) {
            hasField = false;
            for (const argName in args) {
                const argGraphQLTypeName = argGraphQLTypeMap.get(argName);
                if (argGraphQLTypeName !== undefined) {
                    hasField = true;
                    break;
                }
                else {
                    console.warn(`Unexpected argument: ${argName}`);
                }
            }
        }
        else {
            hasField = Object.keys(args).length !== 0;
        }
        if (hasField) {
            this.writer.scope({ type: "ARGUMENTS", multiLines: isMultLineJSON(args) }, () => {
                for (const argName in args) {
                    this.writer.seperator();
                    const arg = args[argName];
                    if (argGraphQLTypeMap !== undefined) {
                        const argGraphQLTypeName = argGraphQLTypeMap.get(argName);
                        if (argGraphQLTypeName !== undefined) {
                            if (arg[" $__instanceOfParameterRef"]) {
                                const parameterRef = arg;
                                if (parameterRef.graphqlTypeName !== undefined && parameterRef.graphqlTypeName !== argGraphQLTypeName) {
                                    throw new Error(`Argument '${parameterRef.name}' has conflict type, the type of paremter '${argName}' is '${argGraphQLTypeName}' ` +
                                        `but the graphqlTypeName of ParameterRef is '${parameterRef.graphqlTypeName}'`);
                                }
                                const registeredType = this.variableTypeMap.get(parameterRef.name);
                                if (registeredType !== undefined && registeredType !== argGraphQLTypeName) {
                                    throw new Error(`Argument '${parameterRef.name}' has conflict type, it's typed has been specified twice, ` +
                                        `one as '${registeredType}' and one as '${argGraphQLTypeName}'`);
                                }
                                this.variableTypeMap.set(parameterRef.name, argGraphQLTypeName);
                                t(`${argName}: $${parameterRef.name}`);
                            }
                            else {
                                t(`${argName}: `);
                                this.acceptLiteral(arg, ResultContext.enumInputMetaType(enumInputMetadata, argGraphQLTypeName));
                            }
                        }
                        else {
                            throw new Error(`Unknown argument '${argName}'`);
                        }
                    }
                    else {
                        if (arg[" $__instanceOfParameterRef"]) {
                            const parameterRef = arg;
                            if (parameterRef.graphqlTypeName === undefined) {
                                throw new Error(`The graphqlTypeName of directive argument '${parameterRef.name}' is not specifed`);
                            }
                            this.variableTypeMap.set(parameterRef.name, parameterRef.graphqlTypeName);
                            t(`${argName}: $${parameterRef.name}`);
                        }
                        else {
                            t(`${argName}: `);
                            this.acceptLiteral(arg, undefined);
                        }
                    }
                }
            });
        }
    }
    acceptLiteral(value, enumInputMetaType) {
        const t = this.writer.text.bind(this.writer);
        if (value === undefined || value === null) {
            t("null");
        }
        else if (typeof value === 'number') {
            t(value.toString());
        }
        else if (typeof value === 'string') {
            if (enumInputMetaType !== undefined) {
                t(value);
            }
            else {
                t(`"${value.replace('"', '\\"')}"`);
            }
        }
        else if (typeof value === 'boolean') {
            t(value ? "true" : "false");
        }
        else if (value instanceof StringValue) {
            if (value.quotationMarks) {
                t(`"${value.value.replace('"', '\\"')}"`);
            }
            else {
                t(value.value);
            }
        }
        else if (Array.isArray(value) || value instanceof Set) {
            this.writer.scope({ type: "ARRAY" }, () => {
                for (const e of value) {
                    this.writer.seperator(", ");
                    this.acceptLiteral(e, enumInputMetaType);
                }
            });
        }
        else if (value instanceof Map) {
            this.writer.scope({ type: "BLOCK" }, () => {
                var _a;
                for (const [k, v] of value) {
                    this.writer.seperator(", ");
                    this.writer.text(k);
                    t(": ");
                    this.acceptLiteral(v, (_a = enumInputMetaType === null || enumInputMetaType === void 0 ? void 0 : enumInputMetaType.fields) === null || _a === void 0 ? void 0 : _a.get(k));
                }
            });
        }
        else if (typeof value === 'object') {
            this.writer.scope({ type: "BLOCK" }, () => {
                var _a;
                for (const k in value) {
                    this.writer.seperator(", ");
                    this.writer.text(k);
                    t(": ");
                    this.acceptLiteral(value[k], (_a = enumInputMetaType === null || enumInputMetaType === void 0 ? void 0 : enumInputMetaType.fields) === null || _a === void 0 ? void 0 : _a.get(k));
                }
            });
        }
    }
    static enumInputMetaType(enumInputMedata, argGraphQLTypeName) {
        if (enumInputMedata === undefined || argGraphQLTypeName === undefined) {
            return undefined;
        }
        return enumInputMedata.getType(argGraphQLTypeName.replace(/\[|\]|!/, ""));
    }
}
function isMultLineJSON(obj) {
    let size = 0;
    if (Array.isArray(obj)) {
        for (const value of obj) {
            if (typeof value === 'object' && !value[" $__instanceOfParameterRef"]) {
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
            if (typeof value === 'object' && !value[" $__instanceOfParameterRef"]) {
                return true;
            }
            if (++size > 2) {
                return true;
            }
        }
    }
    return false;
}
