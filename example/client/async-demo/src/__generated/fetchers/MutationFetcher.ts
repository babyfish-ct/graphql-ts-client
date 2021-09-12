import type { AcceptableVariables, UnresolvedVariables, FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import {DepartmentInput} from '../inputs';
import {EmployeeInput} from '../inputs';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface MutationFetcher<T extends object, TVariables extends object> extends Fetcher<'Mutation', T, TVariables> {


	directive(name: string, args?: DirectiveArgs): MutationFetcher<T, TVariables>;


	mergeDepartment<
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "mergeDepartment", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		child: Fetcher<'Department', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"mergeDepartment", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: X} : 
				{readonly [key in XAlias]: X}
		), 
		TVariables & XVariables & MutationArgs["mergeDepartment"] & XDirectiveVariables
	>;

	mergeDepartment<
		XArgs extends AcceptableVariables<MutationArgs['mergeDepartment']>, 
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "mergeDepartment", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		args: XArgs, 
		child: Fetcher<'Department', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"mergeDepartment", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: X} : 
				{readonly [key in XAlias]: X}
		), 
		TVariables & XVariables & UnresolvedVariables<XArgs, MutationArgs['mergeDepartment']> & XDirectiveVariables
	>;


	deleteDepartment<
		XAlias extends string = "deleteDepartment", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		optionsConfigurer?: (
			options: FieldOptions<"deleteDepartment", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: string} : 
				{readonly [key in XAlias]: string}
		), 
		TVariables & MutationArgs["deleteDepartment"] & XDirectiveVariables
	>;

	deleteDepartment<
		XArgs extends AcceptableVariables<MutationArgs['deleteDepartment']>, 
		XAlias extends string = "deleteDepartment", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		args: XArgs, 
		optionsConfigurer?: (
			options: FieldOptions<"deleteDepartment", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: string} : 
				{readonly [key in XAlias]: string}
		), 
		TVariables & UnresolvedVariables<XArgs, MutationArgs['deleteDepartment']> & XDirectiveVariables
	>;


	mergeEmployee<
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "mergeEmployee", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		child: Fetcher<'Employee', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"mergeEmployee", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: X} : 
				{readonly [key in XAlias]: X}
		), 
		TVariables & XVariables & MutationArgs["mergeEmployee"] & XDirectiveVariables
	>;

	mergeEmployee<
		XArgs extends AcceptableVariables<MutationArgs['mergeEmployee']>, 
		X extends object, 
		XVariables extends object, 
		XAlias extends string = "mergeEmployee", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		args: XArgs, 
		child: Fetcher<'Employee', X, XVariables>, 
		optionsConfigurer?: (
			options: FieldOptions<"mergeEmployee", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: X} : 
				{readonly [key in XAlias]: X}
		), 
		TVariables & XVariables & UnresolvedVariables<XArgs, MutationArgs['mergeEmployee']> & XDirectiveVariables
	>;


	deleteEmployee<
		XAlias extends string = "deleteEmployee", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		optionsConfigurer?: (
			options: FieldOptions<"deleteEmployee", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: string} : 
				{readonly [key in XAlias]: string}
		), 
		TVariables & MutationArgs["deleteEmployee"] & XDirectiveVariables
	>;

	deleteEmployee<
		XArgs extends AcceptableVariables<MutationArgs['deleteEmployee']>, 
		XAlias extends string = "deleteEmployee", 
		XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
		XDirectiveVariables extends object = {}
	>(
		args: XArgs, 
		optionsConfigurer?: (
			options: FieldOptions<"deleteEmployee", {}, {}>
		) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
	): MutationFetcher<
		T & (
			XDirectives extends { readonly include: any } | { readonly skip: any } ? 
				{readonly [key in XAlias]?: string} : 
				{readonly [key in XAlias]: string}
		), 
		TVariables & UnresolvedVariables<XArgs, MutationArgs['deleteEmployee']> & XDirectiveVariables
	>;
}
export const mutation$: MutationFetcher<{}, {}> = 
	createFetcher(
		createFetchableType(
			"Mutation", 
			[], 
			[
				{
					isFunction: true, 
					isPlural: false, 
					name: "mergeDepartment", 
					argGraphQLTypeMap: {input: 'DepartmentInput!'}
				}, 
				{
					isFunction: true, 
					isPlural: false, 
					name: "deleteDepartment", 
					argGraphQLTypeMap: {id: 'ID'}
				}, 
				{
					isFunction: true, 
					isPlural: false, 
					name: "mergeEmployee", 
					argGraphQLTypeMap: {input: 'EmployeeInput!'}
				}, 
				{
					isFunction: true, 
					isPlural: false, 
					name: "deleteEmployee", 
					argGraphQLTypeMap: {id: 'ID'}
				}
			]
		), 
		undefined
	)
;

export interface MutationArgs {

	readonly mergeDepartment: {
		readonly input: DepartmentInput
	}, 

	readonly deleteDepartment: {
		readonly id?: string
	}, 

	readonly mergeEmployee: {
		readonly input: EmployeeInput
	}, 

	readonly deleteEmployee: {
		readonly id?: string
	}
}