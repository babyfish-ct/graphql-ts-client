import type { AcceptableVariables, UnresolvedVariables, FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface QueryFetcher<T extends object, TVariables extends object> extends Fetcher<'Query', T, TVariables> {


	directive(name: string, args?: DirectiveArgs): QueryFetcher<T, TVariables>;

	invisibleDirective(name: string, args?: DirectiveArgs): QueryFetcher<T, TVariables>;


	findDepartmentsLikeName<
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "findDepartmentsLikeName", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		child: Fetcher<'Department', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"findDepartmentsLikeName", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): QueryFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: readonly X[]} : 
				{readonly [key in XAlias]: readonly X[]}
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
		child: Fetcher<'Department', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"findDepartmentsLikeName", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): QueryFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: readonly X[]} : 
				{readonly [key in XAlias]: readonly X[]}
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
		child: Fetcher<'Employee', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"findEmployees", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): QueryFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: readonly X[]} : 
				{readonly [key in XAlias]: readonly X[]}
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
		child: Fetcher<'Employee', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"findEmployees", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): QueryFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: readonly X[]} : 
				{readonly [key in XAlias]: readonly X[]}
		), 
		TVariables & XVariables & UnresolvedVariables<XArgs, QueryArgs['findEmployees']> & XDirectiveVariables
	>;


	node<
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "node", 
		XDirectiveVariables extends object = {}
	>(
		child: Fetcher<'Node', X, XVariables>, 
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
		child: Fetcher<'Node', X, XVariables>, 
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
			[], 
			[
				{
					isFunction: true, 
					isPlural: true, 
					name: "findDepartmentsLikeName", 
					argGraphQLTypeMap: {name: 'String'}
				}, 
				{
					isFunction: true, 
					isPlural: true, 
					name: "findEmployees", 
					argGraphQLTypeMap: {
						mockedErrorProbability: 'Int', 
						supervisorId: 'String', 
						departmentId: 'String', 
						name: 'String'
					}
				}, 
				{
					isFunction: true, 
					isPlural: false, 
					name: "node", 
					argGraphQLTypeMap: {id: 'ID!'}
				}
			]
		), 
		undefined
	)
;

interface QueryArgs {

	readonly findDepartmentsLikeName: {
		readonly name?: string
	}, 

	readonly findEmployees: {
		readonly mockedErrorProbability?: number, 
		readonly supervisorId?: string, 
		readonly departmentId?: string, 
		readonly name?: string
	}, 

	readonly node: {
		readonly id: string
	}
}