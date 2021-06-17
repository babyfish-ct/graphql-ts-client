"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetcher = void 0;
const Fetcher_1 = require("./Fetcher");
function createFetcher(...methodNames) {
    return new Proxy(FETCHER_TARGET, proxyHandler(new Set(methodNames)));
}
exports.createFetcher = createFetcher;
class FetcherTarget extends Fetcher_1.AbstractFetcher {
    createFetcher(prev, negative, field, args, child) {
        return new FetcherTarget(prev, negative, field, args, child);
    }
}
function proxyHandler(methodNames) {
    const handler = {
        get: (target, p, receiver) => {
            const field = p.toString();
            if (BUILT_IN_FIELDS.has(field)) {
                return Reflect.get(target, field);
            }
            if (field.startsWith("~")) {
                const removeField = Reflect.get(target, "removeField");
                return new Proxy(removeField.call(target, field.substring(1)), handler);
            }
            if (methodNames.has(field)) {
                return new Proxy(dummyTargetMethod, methodProxyHandler(target, handler, field));
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
const FETCHER_TARGET = new FetcherTarget(undefined, false, "");
const BUILT_IN_FIELDS = new Set([
    ...Object.keys(FETCHER_TARGET),
    ...Reflect.ownKeys(Fetcher_1.AbstractFetcher.prototype)
]);
