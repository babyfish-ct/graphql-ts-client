import { Fetcher, replaceNullValues } from 'graphql-ts-client-api';
import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, gql } from '@apollo/client';
import {DepartmentInput} from './inputs';
import {EmployeeInput} from './inputs';


export function useTypedMutation<
	TMutationKey extends keyof MutationFetchableTypes, 
	T extends object, 
	TContext = DefaultContext, 
	TCache extends ApolloCache<any> = ApolloCache<any>, 
	TDataKey extends string = TMutationKey
>(
	key: TMutationKey | {
		readonly mutationKey: TMutationKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<MutationFetchableTypes[TMutationKey], T>, 
	options?: MutationHookOptions<Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, MutationVariables[TMutationKey], TContext>
): MutationTuple<
	Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
	MutationVariables[TMutationKey], 
	TContext, 
	TCache
> {
	const mutationKey = typeof key === 'string' ? key : key.mutationKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const operationName = typeof key === 'object' ? key.operationName : undefined;
	const request = `
		mutation ${operationName ?? mutationKey}${GQL_PARAMS[mutationKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${mutationKey}${GQL_ARGS[mutationKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
	const response = useMutation<
		Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
		MutationVariables[TMutationKey], 
		TContext, 
		TCache
	>(gql(request), options);
	replaceNullValues(response[1].data);
	return response;
}

export function useSimpleMutation<
	TMutationKey extends Exclude<keyof MutationVariables, keyof MutationFetchableTypes>, 
	TContext = DefaultContext, 
	TCache extends ApolloCache<any> = ApolloCache<any>, 
	TDataKey extends string = TMutationKey
>(
	key: TMutationKey | {
		readonly mutationKey: TMutationKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	options?: MutationHookOptions<Record<TDataKey, MutationSimpleTypes[TMutationKey]>, MutationVariables[TMutationKey], TContext>
): MutationTuple<
	Record<TDataKey, MutationSimpleTypes[TMutationKey]>, 
	MutationVariables[TMutationKey], 
	TContext, 
	TCache
> {
	const mutationKey = typeof key === 'string' ? key : key.mutationKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const operationName = typeof key === 'object' ? key.operationName : undefined;
	const request = `
		mutation ${operationName ?? mutationKey}${GQL_PARAMS[mutationKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${mutationKey}${GQL_ARGS[mutationKey] ?? ""}}
	`;
	return useMutation<
		Record<TDataKey, MutationSimpleTypes[TMutationKey]>, 
		MutationVariables[TMutationKey], 
		TContext, 
		TCache
	>(gql(request), options);
}

//////////////////////////////////////////////////

export interface MutationVariables{
	mergeDepartment: {readonly input: DepartmentInput};
	deleteDepartment: {readonly id: string};
	mergeEmployee: {readonly input: EmployeeInput};
	deleteEmployee: {readonly id: string};
}

export interface MutationFetchableTypes {
	mergeDepartment: 'Department';
	mergeEmployee: 'Employee';
}

export interface MutationFetchedTypes<T> {
	mergeDepartment: T;
	mergeEmployee: T;
}

export interface MutationSimpleTypes {
	deleteDepartment: boolean;
	deleteEmployee: boolean;
}

//////////////////////////////////////////////////

const GQL_PARAMS: {[key: string]: string} = {
	"mergeDepartment": "($input: DepartmentInput!)", 
	"deleteDepartment": "($id: String!)", 
	"mergeEmployee": "($input: EmployeeInput!)", 
	"deleteEmployee": "($id: String!)"
};

const GQL_ARGS: {[key: string]: string} = {
	"mergeDepartment": "(input: $input)", 
	"deleteDepartment": "(id: $id)", 
	"mergeEmployee": "(input: $input)", 
	"deleteEmployee": "(id: $id)"
};
