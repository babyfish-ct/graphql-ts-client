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
exports.createFetcher = void 0;
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
    createFetcher(negative, field, args, child, fragmentName) {
        return new FetcherTarget(this, negative, field, args, child, fragmentName);
    }
}
function proxyHandler(fetchableType, methodNames) {
    const handler = {
        get: (target, p, receiver) => {
            if (typeof p !== 'string' || BUILT_IN_FIELDS.has(p)) {
                const value = Reflect.get(target, p);
                if (typeof value === "function") {
                    return value.bind(target);
                }
                return value;
            }
            if (p === "fetchableType") {
                return fetchableType;
            }
            if (p.startsWith("~")) {
                const removeField = Reflect.get(target, "removeField");
                return new Proxy(removeField.call(target, p.substring(1)), handler);
            }
            if (p === "on" || p === "asFragment" || methodNames.has(p)) {
                return new Proxy(dummyTargetMethod, methodProxyHandler(target, handler, p));
            }
            const addField = Reflect.get(target, "addField");
            return new Proxy(addField.call(target, p.toString()), handler);
        }
    };
    return handler;
}
;
function methodProxyHandler(targetFetcher, handler, field) {
    return {
        apply: (_1, _2, argArray) => {
            if (field === "on") {
                let child = argArray[0];
                const addEmbbeddable = Reflect.get(targetFetcher, "addEmbbeddable");
                return new Proxy(addEmbbeddable.call(targetFetcher, child), handler);
            }
            if (field === "asFragment") {
                let name = argArray[0];
                const addFragment = Reflect.get(targetFetcher, "addFragment");
                return new Proxy(addFragment.call(targetFetcher, name), handler);
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
const FETCHER_TARGET = new FetcherTarget([{ entityName: "Any", superTypes: [], declaredFields: new Set() }, undefined], false, "");
const BUILT_IN_FIELDS = new Set([
    ...Object.keys(FETCHER_TARGET),
    ...Reflect.ownKeys(Fetcher_1.AbstractFetcher.prototype),
    "_str",
    "_json"
]);
console.log(BUILT_IN_FIELDS);
