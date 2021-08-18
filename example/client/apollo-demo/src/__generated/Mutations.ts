import { Fetcher, util } from 'graphql-ts-client-api';
import { DocumentNode } from 'graphql';
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

		/*
		 * OperationName is not necessary, and it is not recommended to specify its value.
		 * If it's not speicified, a md5 code base on the request is used to be the suffix of actual operation name.
		 * 
		 * Maybe sometimes you need to make the request body more readable, you can specify it,
		 * but be careful, please make sure each query has a unique operations; 
		 * otherwise, both Apollo/client and DependencyManager cannot work normally.
		 * Please view "Each included query is executed with its most recently provided set of variables."
		 * in https://www.apollographql.com/docs/react/data/mutations/#refetching-queries to know more.
		 */
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
	const requestWithoutOperation = `
		${GQL_PARAMS[mutationKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${mutationKey}${GQL_ARGS[mutationKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
	const request = useMemo<DocumentNode>(() => {
		const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? `${mutationKey}_${util.toMd5(requestWithoutOperation)}`;
		return gql`mutation ${operationName}${requestWithoutOperation}`;
	}, [mutationKey, requestWithoutOperation, key]);
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
	>(request, newOptions);
	const responseData = response[1].data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft[1].data = util.produce(newResponseData, () => {});
	});
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
	const requestWithoutOperation = `
		${GQL_PARAMS[mutationKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${mutationKey}${GQL_ARGS[mutationKey] ?? ""}}
	`;
	const request = useMemo<DocumentNode>(() => {
		const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? `${mutationKey}_${util.toMd5(requestWithoutOperation)}`;
		return gql`mutation ${operationName}${requestWithoutOperation}`;
	}, [mutationKey, requestWithoutOperation, key]);
	return useMutation<
		Record<TDataKey, MutationSimpleTypes[TMutationKey]>, 
		MutationVariables[TMutationKey], 
		TContext, 
		TCache
	>(request, options);
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
	deleteDepartment: string;
	deleteEmployee: string;
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
