/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { AbstractFetcher, Fetcher } from './Fetcher';

/*
 * In order to reduce compacity of compiled target code,
 * the code generator does not generate derived classes of AbstractFetcher.
 *  
 * Code generator only generates derived interfaces of Fetcher(
 * interfaces cannot affect the capacity of compilied targe code
 * ), and this "createFetcher" method uses proxies to create instances of those interfaces.
 */
export function createFetcher<A, F extends Fetcher<A, object>>(...methodNames: string[]) {
    return new Proxy(
        FETCHER_TARGET,
        proxyHandler(new Set<string>(methodNames))
    ) as F;
}

class FetcherTarget extends AbstractFetcher<unknown, object> {

    protected createFetcher(
        prev: AbstractFetcher<unknown, any> | undefined,
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<unknown, any>
    ): AbstractFetcher<unknown, any> {
        return new FetcherTarget(
            prev,
            negative,
            field,
            args,
            child
        );
    }
}

function proxyHandler(methodNames: Set<string>): ProxyHandler<Fetcher<unknown, object>> {

    const handler = {
        get: (target: AbstractFetcher<unknown, object>, p: string | symbol, receiver: any): any => {
            if (typeof p !== 'string' || BUILT_IN_FIELDS.has(p)) {
                const value = Reflect.get(target, p);
                if (typeof value === "function") {
                    return value.bind(target);
                }
                return value;
            }
            if (p.startsWith("~")) {
                const removeField = Reflect.get(target, "removeField") as REMOVE_FILED;
                return new Proxy(
                    removeField.call(target, p.substring(1)),
                    handler
                );
            }
            if (methodNames.has(p)) {
                return new Proxy(
                    dummyTargetMethod,
                    methodProxyHandler(target, handler, p)
                );
            }
            const addField = Reflect.get(target, "addField") as ADD_FILED;
            return new Proxy(
                addField.call(target, p.toString()),
                handler
            );
        }
    };
    return handler;
};

function methodProxyHandler(
    targetFetcher: AbstractFetcher<unknown, any>, 
    handler: ProxyHandler<Fetcher<unknown, object>>,
    field: string
): ProxyHandler<Function> {

    return {
        apply: (_1: Function, _2: any, argArray: any[]): any => {
            let args: {[key: string]: any} | undefined = undefined;
            let child: AbstractFetcher<unknown, any> | undefined = undefined;
            switch (argArray.length) {
                case 1:
                    if (argArray[0] instanceof AbstractFetcher) {
                        child = argArray[0];
                    } else {
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
            const addField = Reflect.get(targetFetcher, "addField") as ADD_FILED;
            return new Proxy(
                addField.call(targetFetcher, field, args, child),
                handler
            );
        }
    }
}

type ADD_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: (AbstractFetcher<unknown, any>)
) => AbstractFetcher<unknown, any>;

type REMOVE_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: (AbstractFetcher<unknown, any>)
) => AbstractFetcher<unknown, any>;

function dummyTargetMethod() {}

const FETCHER_TARGET = new FetcherTarget(undefined, false, "");

const BUILT_IN_FIELDS = new Set<string>(
    [
        ...Object.keys(FETCHER_TARGET),
        ...Reflect.ownKeys(AbstractFetcher.prototype) as string[],
        "_str",
        "_json"
    ]
);