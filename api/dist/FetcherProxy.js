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
    createFetcher(negative, field, args, child) {
        return new FetcherTarget(this, negative, field, args, child);
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
                else if (p === "on" || ((_a = fetchableType.fields.get(p)) === null || _a === void 0 ? void 0 : _a.isFunction) === true) {
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
            if (field === "on") {
                const child = argArray[0];
                const fragmentName = argArray[1];
                const addEmbbeddable = Reflect.get(targetFetcher, "addEmbbeddable");
                if (child instanceof Fetcher_1.FragmentWrapper) {
                    return new Proxy(addEmbbeddable.call(targetFetcher, child.fetcher, child.name), handler);
                }
                return new Proxy(addEmbbeddable.call(targetFetcher, child, fragmentName), handler);
            }
            let args = undefined;
            let child = undefined;
            switch (argArray.length) {
                case 1:
                    if (argArray[0] instanceof Fetcher_1.AbstractFetcher) {
                        child = argArray[0];
                    }
                    else {
                        args = argArray[0];
                    }
                    break;
                case 2:
                    child = argArray[0];
                    args = argArray[1];
                    break;
                default:
                    throw new Error("Fetcher method must have 1 or 2 argument(s)");
            }
            const addField = Reflect.get(targetFetcher, "addField");
            return new Proxy(addField.call(targetFetcher, field, args, child), handler);
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
