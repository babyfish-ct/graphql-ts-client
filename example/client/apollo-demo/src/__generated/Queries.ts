import { Fetcher, util } from 'graphql-ts-client-api';
import { DocumentNode } from 'graphql';
import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';
import { useContext, useEffect, useMemo } from 'react';
import { dependencyManagerContext } from './DependencyManager';


export function useTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
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
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryResult<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> {
	const queryKey = typeof key === 'string' ? key : key.queryKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const requestWithoutOperation = `
		${GQL_PARAMS[queryKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${queryKey}${GQL_ARGS[queryKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
	const [operationName, request] = useMemo<[string, DocumentNode]>(() => {
		const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? `${queryKey}_${util.toMd5(requestWithoutOperation)}`;
		return [operationName, gql`query ${operationName}${requestWithoutOperation}`];
	}, [queryKey, requestWithoutOperation, key]);
	const [dependencyManager, config] = useContext(dependencyManagerContext);
	const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;
	if (register && dependencyManager === undefined) {
		throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");
	}
	useEffect(() => {
		if (register) {
			dependencyManager!.register(
				operationName ?? queryKey, 
				fetcher, 
				typeof options?.registerDependencies === 'object' ? options?.registerDependencies?.fieldDependencies : undefined
			);
			return () => { dependencyManager!.unregister(operationName ?? queryKey); };
		}// eslint-disable-next-line
	}, [register, dependencyManager, operationName, queryKey, options?.registerDependencies, request]); // Eslint disable is required, becasue 'fetcher' is replaced by 'request' here.
	const response = useQuery<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>(request, options);
	const responseData = response.data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft.data = util.produce(newResponseData, () => {});
	});
}

export function useLazyTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
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
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryTuple<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> {
	const queryKey = typeof key === 'string' ? key : key.queryKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const requestWithoutOperation = `
		${GQL_PARAMS[queryKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${queryKey}${GQL_ARGS[queryKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
	const [operationName, request] = useMemo<[string, DocumentNode]>(() => {
		const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? `${queryKey}_${util.toMd5(requestWithoutOperation)}`;
		return [operationName, gql`query ${operationName}${requestWithoutOperation}`];
	}, [queryKey, requestWithoutOperation, key]);
	const [dependencyManager, config] = useContext(dependencyManagerContext);
	const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;
	if (register && dependencyManager === undefined) {
		throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");
	}
	useEffect(() => {
		if (register) {
			dependencyManager!.register(
				operationName ?? queryKey, 
				fetcher, 
				typeof options?.registerDependencies === 'object' ? options?.registerDependencies?.fieldDependencies : undefined
			);
			return () => { dependencyManager!.unregister(operationName ?? queryKey); };
		}// eslint-disable-next-line
	}, [register, dependencyManager, operationName, queryKey, options?.registerDependencies, request]); // Eslint disable is required, becasue 'fetcher' is replaced by 'request' here.
	const response = useLazyQuery<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>(request, options);
	const responseData = response[1].data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft[1].data = util.produce(newResponseData, () => {});
	});
}

//////////////////////////////////////////////////

export interface QueryVariables{
	findDepartmentsLikeName: {readonly name?: string};
	findEmployees: {
		readonly mockedErrorProbability?: number, 
		readonly supervisorId?: string, 
		readonly departmentId?: string, 
		readonly name?: string
	};
}

export interface QueryFetchableTypes {
	findDepartmentsLikeName: 'Department';
	findEmployees: 'Employee';
}

export interface QueryFetchedTypes<T> {
	findDepartmentsLikeName: readonly T[];
	findEmployees: readonly T[];
}

export interface QuerySimpleTypes {
}

//////////////////////////////////////////////////

const GQL_PARAMS: {[key: string]: string} = {
	"findDepartmentsLikeName": "($name: String)", 
	"findEmployees": "($mockedErrorProbability: Int, $supervisorId: String, $departmentId: String, $name: String)"
};

const GQL_ARGS: {[key: string]: string} = {
	"findDepartmentsLikeName": "(name: $name)", 
	"findEmployees": "(mockedErrorProbability: $mockedErrorProbability, supervisorId: $supervisorId, departmentId: $departmentId, name: $name)"
};
