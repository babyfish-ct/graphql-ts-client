/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { AbstractFetcher, FetchableType, Fetcher } from './Fetcher';

/*
 * In order to reduce compacity of compiled target code,
 * the code generator does not generate derived classes of AbstractFetcher.
 *  
 * Code generator only generates derived interfaces of Fetcher(
 * interfaces cannot affect the capacity of compilied targe code
 * ), and this "createFetcher" method uses proxies to create instances of those interfaces.
 */
export function createFetcher<E extends string, F extends Fetcher<E, object>>(
    fetchableType: FetchableType<E>,
    unionEntityTypes: string[] | undefined,
    methodNames: string[]
) {
    return new Proxy(
        new FetcherTarget([fetchableType, unionEntityTypes], false, ""),
        proxyHandler(fetchableType, new Set<string>(methodNames))
    ) as F;
}
 
class FetcherTarget<E extends string> extends AbstractFetcher<E, object> {
 
    protected createFetcher(
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, any>
    ): AbstractFetcher<string, any> {
        return new FetcherTarget(
            this,
            negative,
            field,
            args,
            child
        );
    }
}
 
function proxyHandler(
   fetchableType: FetchableType<string>, 
   methodNames: Set<string>
): ProxyHandler<Fetcher<string, object>> {
 
    const handler = {
        get: (target: AbstractFetcher<string, object>, p: string | symbol, receiver: any): any => {
            if (p === "fetchableType") {
                return fetchableType;
            }
            if (typeof p === 'string') {
                if (p.startsWith("~")) {
                    const rest = p.substring(1);
                    if (fetchableType.fields.has(rest)) {
                        const removeField = Reflect.get(target, "removeField") as REMOVE_FILED;
                        return new Proxy(
                            removeField.call(target, rest),
                            handler
                        );
                    }
                } else if (fetchableType.fields.has(p)) {
                    const addField = Reflect.get(target, "addField") as ADD_FILED;
                    return new Proxy(
                        addField.call(target, p.toString()),
                        handler
                    );
                }
            }
            return Reflect.get(target, p, receiver);
        }
    };
     return handler;
};
 
function methodProxyHandler(
    targetFetcher: AbstractFetcher<string, any>, 
    handler: ProxyHandler<Fetcher<string, object>>,
    field: string
): ProxyHandler<Function> {

    return {
        apply: (_1: Function, _2: any, argArray: any[]): any => {
            if (field === "on") {
                const child = argArray[0] as AbstractFetcher<string, any>;
                const fragmentName = argArray[1] as string | undefined
                const addEmbbeddable = Reflect.get(targetFetcher, "addEmbbeddable") as ADD_EMBBEDDABLE;
                return new Proxy(
                    addEmbbeddable.call(targetFetcher, child, fragmentName),
                    handler
                );
            }
            let args: {[key: string]: any} | undefined = undefined;
            let child: AbstractFetcher<string, any> | undefined = undefined;
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
    child?: (AbstractFetcher<string, any>)
) => AbstractFetcher<string, any>;
 
type REMOVE_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: (AbstractFetcher<string, any>)
) => AbstractFetcher<string, any>;
 
type ADD_EMBBEDDABLE = (
    child: AbstractFetcher<string, any>,
    fragmentName?: string
) => AbstractFetcher<string, any>;

function dummyTargetMethod() {}

export function createFetchableType<E extends string>(
    entityName: string,
    superTypes: readonly FetchableType<string>[],
    declaredFields: readonly string[]
) {
    return new FetchableTypeImpl(entityName, superTypes, new Set<string>(declaredFields));
}

class FetchableTypeImpl<E extends string> implements FetchableType<E> {

    private _fields?: ReadonlySet<string>;

    constructor(
        readonly entityName: E,
        readonly superTypes: readonly FetchableType<string>[],
        readonly declaredFields: ReadonlySet<string>
    ) {}

    get fields(): ReadonlySet<string> {
        let fds = this._fields;
        if (fds === undefined) {
            if (this.superTypes.length === 0) {
                fds = this.declaredFields;
            } else {
                const set = new Set<string>();
                collectFields(this, set);
                fds = set;
            }
            this._fields = fds;
        }
        return fds;
    }
}

function collectFields(fetchableType: FetchableType<string>, output: Set<string>) {
    for (const field of fetchableType.declaredFields) {
        output.add(field);
    }
    for (const superType of fetchableType.superTypes) {
        collectFields(superType, output);
    }
}

const FETCHER_TARGET = new FetcherTarget(
    [createFetchableType("Any", [], []), undefined], 
    false, 
    ""
);