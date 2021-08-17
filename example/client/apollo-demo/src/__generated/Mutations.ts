import { Fetcher, replaceNullValues } from 'graphql-ts-client-api';
import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, FetchResult, InternalRefetchQueriesInclude, gql } from '@apollo/client';
import { useContext, useMemo } from 'react';
import { dependencyManagerContext, RefetchableDependencies } from './DependencyManager';
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
	options?: MutationHookOptions<Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, MutationVariables[TMutationKey], TContext> & {
		readonly refetchDependencies?: (
			result: FetchResult<Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>> &{ dependencies: RefetchableDependencies<T> }
		) => InternalRefetchQueriesInclude
	}
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
	const [dependencyManager] = useContext(dependencyManagerContext);
	if (options?.refetchDependencies && dependencyManager === undefined) {
		throw new Error("The property 'refetchDependencies' of options requires <DependencyManagerProvider/>");
	}const dependencies = useMemo<RefetchableDependencies<T>>(() => {
		const ofResult = (oldObject: T | undefined, newObject?: T | undefined): string[] => {
			return dependencyManager!.resources(fetcher, oldObject, newObject);
		};
		const ofError = (): string[] => {
			return [];
		};
		return { ofResult, ofError };
		// eslint-disable-next-line
	}, [dependencyManager, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.
	if (options?.refetchDependencies && options?.refetchQueries) {
		throw new Error("The property 'refetchDependencies' and 'refetchQueries' of options cannot be specified at the same time");
	}
	const newOptions = useMemo<MutationHookOptions<
		Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
		MutationVariables[TMutationKey], 
		TContext
	> | undefined>(() => {
		const refetchDependencies = options?.refetchDependencies;
		if (refetchDependencies === undefined) {
			return options;
		}
		const cloned: MutationHookOptions<
			Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
			MutationVariables[TMutationKey], 
			TContext
		> = { ...options };
		cloned.refetchQueries = result => {
			return refetchDependencies({...result, dependencies});
		}
		return cloned;
	}, [options, dependencies]);
	const response = useMutation<
		Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
		MutationVariables[TMutationKey], 
		TContext, 
		TCache
	>(gql(request), newOptions);
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
