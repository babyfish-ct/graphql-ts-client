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
function createFetcher(fetchableType, unionEntityTypes, methodNames) {
    return new Proxy(new FetcherTarget([fetchableType, unionEntityTypes], false, ""), proxyHandler(fetchableType, new Set(methodNames)));
}
exports.createFetcher = createFetcher;
class FetcherTarget extends Fetcher_1.AbstractFetcher {
    createFetcher(negative, field, args, child) {
        return new FetcherTarget(this, negative, field, args, child);
    }
}
function proxyHandler(fetchableType, methodNames) {
    const handler = {
        get: (target, p, receiver) => {
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
                else if (fetchableType.fields.has(p)) {
                    const addField = Reflect.get(target, "addField");
                    return new Proxy(addField.call(target, p.toString()), handler);
                }
            }
            return Reflect.get(target, p, receiver);
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
                    args = argArray[0];
                    child = argArray[1];
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
    return new FetchableTypeImpl(entityName, superTypes, new Set(declaredFields));
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
                const set = new Set();
                collectFields(this, set);
                fds = set;
            }
            this._fields = fds;
        }
        return fds;
    }
}
function collectFields(fetchableType, output) {
    for (const field of fetchableType.declaredFields) {
        output.add(field);
    }
    for (const superType of fetchableType.superTypes) {
        collectFields(superType, output);
    }
}
const FETCHER_TARGET = new FetcherTarget([createFetchableType("Any", [], []), undefined], false, "");
