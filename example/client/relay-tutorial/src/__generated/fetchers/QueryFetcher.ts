import type { AcceptableVariables, UnresolvedVariables, FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { ObjectFetcher, ConnectionFetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import { FragmentRefs } from 'relay-runtime';
import { TypedFragment } from 'graphql-ts-client-relay';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface QueryFetcher<T extends object, TVariables extends object> extends ObjectFetcher<'Query', T, TVariables> {

    on<XFragmentName extends string, XData extends object, XVariables extends object>(
        child: TypedFragment<XFragmentName, "Query", XData, XVariables>
    ): QueryFetcher<
        T & {
            readonly " $data": XData, 
            readonly " $fragmentRefs": FragmentRefs<XFragmentName>
        }, 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): QueryFetcher<T, TVariables>;


    findDepartmentsLikeName<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "findDepartmentsLikeName", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ConnectionFetcher<'DepartmentConnection', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"findDepartmentsLikeName", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): QueryFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & QueryArgs["findDepartmentsLikeName"] & XDirectiveVariables
    >;

    findDepartmentsLikeName<
        XArgs extends AcceptableVariables<QueryArgs['findDepartmentsLikeName']>, 
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "findDepartmentsLikeName", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        args: XArgs, 
        child: ConnectionFetcher<'DepartmentConnection', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"findDepartmentsLikeName", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): QueryFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & UnresolvedVariables<XArgs, QueryArgs['findDepartmentsLikeName']> & XDirectiveVariables
    >;


    findEmployees<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "findEmployees", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ConnectionFetcher<'EmployeeConnection', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"findEmployees", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): QueryFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & QueryArgs["findEmployees"] & XDirectiveVariables
    >;

    findEmployees<
        XArgs extends AcceptableVariables<QueryArgs['findEmployees']>, 
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "findEmployees", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        args: XArgs, 
        child: ConnectionFetcher<'EmployeeConnection', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"findEmployees", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): QueryFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & UnresolvedVariables<XArgs, QueryArgs['findEmployees']> & XDirectiveVariables
    >;


    node<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "node", 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Node', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"node", {}, {}>
        ) => FieldOptions<XAlias, {readonly [key: string]: DirectiveArgs}, XDirectiveVariables>
    ): QueryFetcher<
        T & {readonly [key in XAlias]?: X}, 
        TVariables & XVariables & QueryArgs["node"] & XDirectiveVariables
    >;

    node<
        XArgs extends AcceptableVariables<QueryArgs['node']>, 
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "node", 
        XDirectiveVariables extends object = {}
    >(
        args: XArgs, 
        child: ObjectFetcher<'Node', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"node", {}, {}>
        ) => FieldOptions<XAlias, {readonly [key: string]: DirectiveArgs}, XDirectiveVariables>
    ): QueryFetcher<
        T & {readonly [key in XAlias]?: X}, 
        TVariables & XVariables & UnresolvedVariables<XArgs, QueryArgs['node']> & XDirectiveVariables
    >;
}

export const query$: QueryFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "Query", 
            "OBJECT", 
            [], 
            [
                {
                    category: "CONNECTION", 
                    name: "findDepartmentsLikeName", 
                    argGraphQLTypeMap: {
                        before: 'String', 
                        last: 'Int', 
                        after: 'String', 
                        first: 'Int', 
                        name: 'String'
                    }, 
                    connectionTypeName: "DepartmentConnection", 
                    edgeTypeName: "DepartmentEdge", 
                    targetTypeName: "Department"
                }, 
                {
                    category: "CONNECTION", 
                    name: "findEmployees", 
                    argGraphQLTypeMap: {
                        before: 'String', 
                        last: 'Int', 
                        after: 'String', 
                        first: 'Int', 
                        mockedErrorProbability: 'Int', 
                        supervisorId: 'String', 
                        departmentId: 'String', 
                        name: 'String'
                    }, 
                    connectionTypeName: "EmployeeConnection", 
                    edgeTypeName: "EmployeeEdge", 
                    targetTypeName: "Employee"
                }, 
                {
                    category: "REFERENCE", 
                    name: "node", 
                    argGraphQLTypeMap: {id: 'ID!'}, 
                    targetTypeName: "Node"
                }
            ]
        ), 
        undefined
    )
;

export interface QueryArgs {

    readonly findDepartmentsLikeName: {
        readonly before?: string, 
        readonly last?: number, 
        readonly after?: string, 
        readonly first?: number, 
        readonly name?: string
    }, 

    readonly findEmployees: {
        readonly before?: string, 
        readonly last?: number, 
        readonly after?: string, 
        readonly first?: number, 
        readonly mockedErrorProbability?: number, 
        readonly supervisorId?: string, 
        readonly departmentId?: string, 
        readonly name?: string
    }, 

    readonly node: {
        readonly id: string
    }
}