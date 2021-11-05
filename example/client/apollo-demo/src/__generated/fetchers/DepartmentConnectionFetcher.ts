import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { ConnectionFetcher, EdgeFetcher, ObjectFetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import type { WithTypeName, ImplementationType } from '../CommonTypes';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface DepartmentConnectionFetcher<T extends object, TVariables extends object> extends ConnectionFetcher<'DepartmentConnection', T, TVariables> {

    on<XName extends ImplementationType<'DepartmentConnection'>, X extends object, XVariables extends object>(
        child: ConnectionFetcher<XName, X, XVariables>, 
        fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
    ): DepartmentConnectionFetcher<
        XName extends 'DepartmentConnection' ?
        T & X :
        WithTypeName<T, ImplementationType<'DepartmentConnection'>> & (
            WithTypeName<X, ImplementationType<XName>> | 
            {__typename: Exclude<ImplementationType<'DepartmentConnection'>, ImplementationType<XName>>}
        ), 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): DepartmentConnectionFetcher<T, TVariables>;


    readonly __typename: DepartmentConnectionFetcher<T & {__typename: ImplementationType<'DepartmentConnection'>}, TVariables>;


    readonly totalCount: DepartmentConnectionFetcher<T & {readonly "totalCount": number}, TVariables>;

    "totalCount+"<
        XAlias extends string = "totalCount", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer: (
            options: FieldOptions<"totalCount", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): DepartmentConnectionFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: number} : 
                {readonly [key in XAlias]: number}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~totalCount": DepartmentConnectionFetcher<Omit<T, 'totalCount'>, TVariables>;


    edges<
        X extends object, 
        XVariables extends object
    >(
        child: EdgeFetcher<'DepartmentEdge', X, XVariables>
    ): DepartmentConnectionFetcher<
        T & {readonly "edges": readonly X[]}, 
        TVariables & XVariables
    >;

    edges<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "edges", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: EdgeFetcher<'DepartmentEdge', X, XVariables>, 
        optionsConfigurer: (
            options: FieldOptions<"edges", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): DepartmentConnectionFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: readonly X[]} : 
                {readonly [key in XAlias]: readonly X[]}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;


    pageInfo<
        X extends object, 
        XVariables extends object
    >(
        child: ObjectFetcher<'PageInfo', X, XVariables>
    ): DepartmentConnectionFetcher<
        T & {readonly "pageInfo": X}, 
        TVariables & XVariables
    >;

    pageInfo<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "pageInfo", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'PageInfo', X, XVariables>, 
        optionsConfigurer: (
            options: FieldOptions<"pageInfo", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): DepartmentConnectionFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;
}

export const departmentConnection$: DepartmentConnectionFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "DepartmentConnection", 
            "CONNECTION", 
            [], 
            [
                "totalCount", 
                {
                    category: "LIST", 
                    name: "edges", 
                    targetTypeName: "DepartmentEdge"
                }, 
                {
                    category: "SCALAR", 
                    name: "pageInfo", 
                    targetTypeName: "PageInfo"
                }
            ]
        ), 
        undefined
    )
;

export const departmentConnection$$ = 
    departmentConnection$
        .totalCount
;
