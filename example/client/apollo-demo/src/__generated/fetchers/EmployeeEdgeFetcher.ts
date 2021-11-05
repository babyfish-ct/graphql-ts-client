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
export interface EmployeeEdgeFetcher<T extends object, TVariables extends object> extends EdgeFetcher<'EmployeeEdge', T, TVariables> {

    on<XName extends ImplementationType<'EmployeeEdge'>, X extends object, XVariables extends object>(
        child: EdgeFetcher<XName, X, XVariables>, 
        fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
    ): EmployeeEdgeFetcher<
        XName extends 'EmployeeEdge' ?
        T & X :
        WithTypeName<T, ImplementationType<'EmployeeEdge'>> & (
            WithTypeName<X, ImplementationType<XName>> | 
            {__typename: Exclude<ImplementationType<'EmployeeEdge'>, ImplementationType<XName>>}
        ), 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): EmployeeEdgeFetcher<T, TVariables>;


    readonly __typename: EmployeeEdgeFetcher<T & {__typename: ImplementationType<'EmployeeEdge'>}, TVariables>;


    node<
        X extends object, 
        XVariables extends object
    >(
        child: ObjectFetcher<'Employee', X, XVariables>
    ): EmployeeEdgeFetcher<
        T & {readonly "node": X}, 
        TVariables & XVariables
    >;

    node<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "node", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Employee', X, XVariables>, 
        optionsConfigurer: (
            options: FieldOptions<"node", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeEdgeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;


    readonly cursor: EmployeeEdgeFetcher<T & {readonly "cursor": string}, TVariables>;

    "cursor+"<
        XAlias extends string = "cursor", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer: (
            options: FieldOptions<"cursor", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeEdgeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~cursor": EmployeeEdgeFetcher<Omit<T, 'cursor'>, TVariables>;
}

export const employeeEdge$: EmployeeEdgeFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "EmployeeEdge", 
            "EDGE", 
            [], 
            [
                {
                    category: "REFERENCE", 
                    name: "node", 
                    targetTypeName: "Employee"
                }, 
                "cursor"
            ]
        ), 
        undefined
    )
;

export const employeeEdge$$ = 
    employeeEdge$
        .cursor
;
