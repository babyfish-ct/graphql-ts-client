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
exports.createFetchableType = exports.createFetcher = void 0;
const Fetcher_1 = require("./Fetcher");
const FieldOptions_1 = require("./FieldOptions");
const Parameter_1 = require("./Parameter");
/*
 * In order to reduce compacity of compiled target code,
 * the code generator does not generate derived classes of AbstractFetcher.
 *
 * Code generator only generates derived interfaces of Fetcher(
 * interfaces cannot affect the capacity of compilied targe code
 * ), and this "createFetcher" method uses proxies to create instances of those interfaces.
 */
function createFetcher(fetchableType, unionEntityTypes) {
    return new Proxy(new FetcherTarget([fetchableType, unionEntityTypes], false, ""), proxyHandler(fetchableType));
}
exports.createFetcher = createFetcher;
class FetcherTarget extends Fetcher_1.AbstractFetcher {
    createFetcher(negative, field, args, child, optionsValue, directive, directiveArgs) {
        return new FetcherTarget(this, negative, field, args, child, optionsValue, directive, directiveArgs);
    }
}
function proxyHandler(fetchableType) {
    const handler = {
        get: (target, p, receiver) => {
            var _a;
            if (p === "fetchableType") {
                return fetchableType;
            }
            if (typeof p === 'string') {
                if (p.startsWith("~")) {
                    const rest = p.substring(1);
                    if (fetchableType.fields.has(rest)) {
                        const removeField = Reflect.get(target, "removeField");
                        return new Proxy(removeField.call(target, rest), handler);
                    }
                }
                else if (p.endsWith("+")) {
                    const rest = p.substring(0, p.length - 1);
                    if (fetchableType.fields.has(rest)) {
                        return new Proxy(dummyTargetMethod, methodProxyHandler(target, handler, rest));
                    }
                }
                else if (p === "on" || p === "directive" || ((_a = fetchableType.fields.get(p)) === null || _a === void 0 ? void 0 : _a.isFunction) === true) {
                    return new Proxy(dummyTargetMethod, methodProxyHandler(target, handler, p));
                }
                else if (fetchableType.fields.has(p)) {
                    const addField = Reflect.get(target, "addField");
                    return new Proxy(addField.call(target, p.toString()), handler);
                }
            }
            return Reflect.get(target, p, target);
        }
    };
    return handler;
}
;
function methodProxyHandler(targetFetcher, handler, field) {
    return {
        apply: (_1, _2, argArray) => {
            var _a;
            if (field === "on") {
                const child = argArray[0];
                const fragmentName = argArray[1];
                const addEmbbeddable = Reflect.get(targetFetcher, "addEmbbeddable");
                if (child instanceof Fetcher_1.FragmentWrapper) {
                    return new Proxy(addEmbbeddable.call(targetFetcher, child.fetcher, child.name), handler);
                }
                return new Proxy(addEmbbeddable.call(targetFetcher, child, fragmentName), handler);
            }
            else if (field === "directive") {
                const directive = argArray[0];
                const directiveArgs = argArray[1];
                const addDirective = Reflect.get(targetFetcher, "addDirective");
                return new Proxy(addDirective.call(targetFetcher, directive, directiveArgs), handler);
            }
            let args = undefined;
            let child = undefined;
            let optionsValue = undefined;
            for (const arg of argArray) {
                if (arg instanceof Fetcher_1.AbstractFetcher) {
                    child = arg;
                }
                else if (typeof arg === 'function') {
                    optionsValue = arg(FieldOptions_1.createFieldOptions()).value;
                }
                else {
                    args = arg;
                }
            }
            if (args === undefined) {
                const argGraphQLTypeMap = (_a = targetFetcher.fetchableType.declaredFields.get(field)) === null || _a === void 0 ? void 0 : _a.argGraphQLTypeMap;
                if (argGraphQLTypeMap !== undefined && argGraphQLTypeMap.size !== 0) {
                    args = {};
                    for (const [name,] of argGraphQLTypeMap) {
                        args[name] = Parameter_1.ParameterRef.of(name);
                    }
                }
            }
            const addField = Reflect.get(targetFetcher, "addField");
            return new Proxy(addField.call(targetFetcher, field, args, child, optionsValue), handler);
        }
    };
}
function dummyTargetMethod() { }
function createFetchableType(entityName, superTypes, declaredFields) {
    const declaredFieldMap = new Map();
    for (const declaredField of declaredFields) {
        if (typeof declaredField === 'string') {
            declaredFieldMap.set(declaredField, {
                name: declaredField,
                isFunction: false,
                isPlural: false,
                argGraphQLTypeMap: new Map()
            });
        }
        else {
            const argGraphQLTypeMap = new Map();
            if (declaredField.argGraphQLTypeMap !== undefined) {
                for (const argName in declaredField.argGraphQLTypeMap) {
                    const argGraphQLType = declaredField.argGraphQLTypeMap[argName];
                    argGraphQLTypeMap.set(argName, argGraphQLType);
                }
            }
            declaredFieldMap.set(declaredField.name, {
                name: declaredField.name,
                isFunction: declaredField.isFunction,
                isPlural: declaredField.isPlural,
                argGraphQLTypeMap
            });
        }
    }
    return new FetchableTypeImpl(entityName, superTypes, declaredFieldMap);
}
exports.createFetchableType = createFetchableType;
class FetchableTypeImpl {
    constructor(entityName, superTypes, declaredFields) {
        this.entityName = entityName;
        this.superTypes = superTypes;
        this.declaredFields = declaredFields;
    }
    get fields() {
        let fds = this._fields;
        if (fds === undefined) {
            if (this.superTypes.length === 0) {
                fds = this.declaredFields;
            }
            else {
                const map = new Map();
                collectFields(this, map);
                fds = map;
            }
            this._fields = fds;
        }
        return fds;
    }
}
function collectFields(fetchableType, output) {
    for (const [name, field] of fetchableType.declaredFields) {
        output.set(name, field);
    }
    for (const superType of fetchableType.superTypes) {
        collectFields(superType, output);
    }
}
const FETCHER_TARGET = new FetcherTarget([createFetchableType("Any", [], []), undefined], false, "");
