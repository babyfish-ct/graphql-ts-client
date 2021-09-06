/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { AbstractFetcher, DirectiveArgs, FetchableField, FetchableType, Fetcher, InvisibleFragment } from './Fetcher';
import { createFieldOptions, FieldOptionsValue } from './FieldOptions';
import { ParameterRef } from './Parameter';

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
        child?: AbstractFetcher<string, object, object>,
        optionsValue?: FieldOptionsValue,
        directive?: string,
        directiveArgs?: DirectiveArgs
    ): AbstractFetcher<string, object, object> {
        return new FetcherTarget(
            this,
            negative,
            field,
            args,
            child,
            optionsValue,
            directive,
            directiveArgs
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
                } else if (p.endsWith("+")) {
                    const rest = p.substring(0, p.length - 1);
                    if (fetchableType.fields.has(rest)) {
                        return new Proxy(
                            dummyTargetMethod,
                            methodProxyHandler(target, handler, rest)
                        );
                    }
                } else if (p === "on" || p === "directive" || fetchableType.fields.get(p)?.isFunction === true) {
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
                const childFetcher = child instanceof InvisibleFragment ? child.fetcher : child as Fetcher<string, object, object>;
                const fragmentName = argArray[1] as string | undefined ?? (child instanceof InvisibleFragment ? child.name : undefined);
                let parentFetcher = targetFetcher;
                if (field === "on" && targetFetcher.fetchableType.entityName !== childFetcher.fetchableType.entityName) {
                    const addField = Reflect.get(targetFetcher, "addField") as ADD_FILED;
                    parentFetcher = addField.call(targetFetcher, "__typename");
                }
                const addEmbbeddable = Reflect.get(parentFetcher, "addEmbbeddable") as ADD_EMBBEDDABLE;
                return new Proxy(
                    addEmbbeddable.call(parentFetcher, childFetcher, fragmentName),
                    handler
                );
            } else if (field === "directive") {
                const directive = argArray[0] as string;
                const directiveArgs = argArray[1] as DirectiveArgs;
                const addDirective = Reflect.get(targetFetcher, "addDirective") as ADD_DIRECTIVE;
                return new Proxy(
                    addDirective.call(targetFetcher, directive, directiveArgs),
                    handler
                );
            }
            let args: {[key: string]: any} | undefined = undefined;
            let child: AbstractFetcher<string, object, object> | undefined = undefined;
            let optionsValue: FieldOptionsValue | undefined = undefined;
            for (const arg of argArray) {
                if (arg instanceof AbstractFetcher) {
                    child = arg as AbstractFetcher<string, object, object>;
                } else if (typeof arg === 'function') {
                    optionsValue = arg(createFieldOptions()).value;
                } else {
                    args = arg;
                }
            }
            if (args === undefined) {
                const argGraphQLTypeMap = targetFetcher.fetchableType.declaredFields.get(field)?.argGraphQLTypeMap;
                if (argGraphQLTypeMap !== undefined && argGraphQLTypeMap.size !== 0) {
                    args = {};
                    for (const [name, ] of argGraphQLTypeMap) {
                        args[name] = ParameterRef.of(name);
                    }
                }
            }
            const addField = Reflect.get(targetFetcher, "addField") as ADD_FILED;
            return new Proxy(
                addField.call(targetFetcher, field, args, child, optionsValue),
                handler
            );
        }
    }
}
 
type ADD_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: AbstractFetcher<string, object, object>,
    optionsValue?: FieldOptionsValue
) => AbstractFetcher<string, object, object>;
 
type REMOVE_FILED = (
    field: string, 
    args?: {[key: string]: any}, 
    child?: AbstractFetcher<string, object, object>
) => AbstractFetcher<string, object, object>;
 
type ADD_EMBBEDDABLE = (
    child: AbstractFetcher<string, object, object>,
    fragmentName?: string
) => AbstractFetcher<string, object, object>;

type ADD_DIRECTIVE = (
    directive: string,
    directiveArgs?: DirectiveArgs
) => AbstractFetcher<string, object, object>;

function dummyTargetMethod() {}

export function createFetchableType<E extends string>(
    entityName: E,
    superTypes: readonly FetchableType<string>[],
    declaredFields: ReadonlyArray<string | { 
        readonly isFunction: boolean,
        readonly isPlural: boolean,
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
                isPlural: false,
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
                isFunction: declaredField.isFunction,
                isPlural: declaredField.isPlural,
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
