/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { AbstractFetcher, FetchableField, FetchableType, Fetcher, FragmentWrapper } from './Fetcher';

/*
 * In order to reduce compacity of compiled target code,
 * the code generator does not generate derived classes of AbstractFetcher.
 *  
 * Code generator only generates derived interfaces of Fetcher(
 * interfaces cannot affect the capacity of compilied targe code
 * ), and this "createFetcher" method uses proxies to create instances of those interfaces.
 */
export function createFetcher<E extends string, F extends Fetcher<E, object, object>>(
    fetchableType: FetchableType<E>,
    unionEntityTypes: string[] | undefined
) {
    return new Proxy(
        new FetcherTarget([fetchableType, unionEntityTypes], false, ""),
        proxyHandler(fetchableType),
    ) as F;
}
 
class FetcherTarget<E extends string> extends AbstractFetcher<E, object, object> {
 
    protected createFetcher(
        negative: boolean,
        field: string,
        args?: {[key: string]: any},
        child?: AbstractFetcher<string, object, object>
    ): AbstractFetcher<string, object, object> {
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
   fetchableType: FetchableType<string>
): ProxyHandler<Fetcher<string, object, object>> {
 
    const handler = {
        get: (target: AbstractFetcher<string, object, object>, p: string | symbol, receiver: any): any => {
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
                } else if (p === "on" || fetchableType.fields.get(p)?.isFunction === true) {
                    return new Proxy(
                        dummyTargetMethod,
                        methodProxyHandler(target, handler, p)
                    );
                } else if (fetchableType.fields.has(p)) {
                    const addField = Reflect.get(target, "addField") as ADD_FILED;
                    return new Proxy(
                        addField.call(target, p.toString()),
                        handler
                    );
                }
            }
            return Reflect.get(target, p, target);
        }
    };
     return handler;
};
 
function methodProxyHandler(
    targetFetcher: AbstractFetcher<string, object, object>, 
    handler: ProxyHandler<Fetcher<string, object, object>>,
    field: string
): ProxyHandler<Function> {

    return {
        apply: (_1: Function, _2: any, argArray: any[]): any => {
            if (field === "on") {
                const child = argArray[0];
                const fragmentName = argArray[1] as string | undefined
                const addEmbbeddable = Reflect.get(targetFetcher, "addEmbbeddable") as ADD_EMBBEDDABLE;
                if (child instanceof FragmentWrapper) {
                    return new Proxy(
                        addEmbbeddable.call(targetFetcher, child.fetcher, child.name),
                        handler
                    );
                }
                return new Proxy(
                    addEmbbeddable.call(targetFetcher, child, fragmentName),
                    handler
                );
            }
            let args: {[key: string]: any} | undefined = undefined;
            let child: AbstractFetcher<string, object, object> | undefined = undefined;
            switch (argArray.length) {
                case 1:
                    if (argArray[0] instanceof AbstractFetcher) {
                        child = argArray[0];
                    } else {
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
    child?: (AbstractFetcher<string, object, object>)
) => AbstractFetcher<string, object, object>;
 
type REMOVE_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: (AbstractFetcher<string, object, object>)
) => AbstractFetcher<string, object, object>;
 
type ADD_EMBBEDDABLE = (
    child: AbstractFetcher<string, object, object>,
    fragmentName?: string
) => AbstractFetcher<string, object, object>;

function dummyTargetMethod() {}

export function createFetchableType<E extends string>(
    entityName: E,
    superTypes: readonly FetchableType<string>[],
    declaredFields: ReadonlyArray<string | { 
        readonly type: "METHOD",
        readonly name: string,
        readonly argGraphQLTypeMap?: { readonly [key: string]: string }
    }>
): FetchableType<E> {
    const declaredFieldMap = new Map<string, FetchableField>();
    for (const declaredField of declaredFields) {
        if (typeof declaredField === 'string') {
            declaredFieldMap.set(declaredField, {
                name: declaredField,
                isFunction: false,
                argGraphQLTypeMap: new Map<string, string>()
            });
        } else {
            const argGraphQLTypeMap = new Map<string, string>();
            if (declaredField.argGraphQLTypeMap !== undefined) {
                for (const argName in  declaredField.argGraphQLTypeMap) {
                    const argGraphQLType = declaredField.argGraphQLTypeMap[argName];
                    argGraphQLTypeMap.set(argName, argGraphQLType);
                }
            }
            declaredFieldMap.set(declaredField.name, {
                name: declaredField.name,
                isFunction: true,
                argGraphQLTypeMap
            });
        }
    }
    return new FetchableTypeImpl<E>(entityName, superTypes, declaredFieldMap);
}

class FetchableTypeImpl<E extends string> implements FetchableType<E> {

    private _fields?: ReadonlyMap<string, FetchableField>;

    constructor(
        readonly entityName: E,
        readonly superTypes: readonly FetchableType<string>[],
        readonly declaredFields: ReadonlyMap<string, FetchableField>
    ) {}

    get fields(): ReadonlyMap<string, FetchableField> {
        let fds = this._fields;
        if (fds === undefined) {
            if (this.superTypes.length === 0) {
                fds = this.declaredFields;
            } else {
                const map = new Map<string, FetchableField>();
                collectFields(this, map);
                fds = map;
            }
            this._fields = fds;
        }
        return fds;
    }
}

function collectFields(fetchableType: FetchableType<string>, output: Map<string, FetchableField>) {
    for (const [name, field] of fetchableType.declaredFields) {
        output.set(name, field);
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
