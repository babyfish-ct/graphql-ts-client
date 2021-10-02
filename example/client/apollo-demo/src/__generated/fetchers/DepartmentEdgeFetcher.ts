import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { EdgeFetcher, ObjectFetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import type { WithTypeName, ImplementationType } from '../CommonTypes';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface DepartmentEdgeFetcher<T extends object, TVariables extends object> extends EdgeFetcher<'DepartmentEdge', T, TVariables> {

    on<XName extends ImplementationType<'DepartmentEdge'>, X extends object, XVariables extends object>(
        child: EdgeFetcher<XName, X, XVariables>, 
        fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
    ): DepartmentEdgeFetcher<
        XName extends 'DepartmentEdge' ?
        T & X :
        WithTypeName<T, ImplementationType<'DepartmentEdge'>> & (
            WithTypeName<X, ImplementationType<XName>> | 
            {__typename: Exclude<ImplementationType<'DepartmentEdge'>, ImplementationType<XName>>}
        ), 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): DepartmentEdgeFetcher<T, TVariables>;


    readonly __typename: DepartmentEdgeFetcher<T & {__typename: ImplementationType<'DepartmentEdge'>}, TVariables>;


    node<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "node", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Department', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"node", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): DepartmentEdgeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;


    readonly cursor: DepartmentEdgeFetcher<T & {readonly "cursor": string}, TVariables>;

    "cursor+"<
        XAlias extends string = "cursor", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"cursor", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): DepartmentEdgeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~cursor": DepartmentEdgeFetcher<Omit<T, 'cursor'>, TVariables>;
}

export const departmentEdge$: DepartmentEdgeFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "DepartmentEdge", 
            "EDGE", 
            [], 
            [
                {
                    category: "REFERENCE", 
                    name: "node"
                }, 
                "cursor"
            ]
        ), 
        undefined
    )
;

export const departmentEdge$$ = 
    departmentEdge$
        .cursor
;
