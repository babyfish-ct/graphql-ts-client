import { Fetcher, replaceNullValues } from 'graphql-ts-client-api';
import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';
import { useContext, useEffect } from 'react';
import { dependencyManagerContext } from './DependencyManager';


export function useTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryResult<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> {
	const queryKey = typeof key === 'string' ? key : key.queryKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const operationName = typeof key === 'object' ? key.operationName : undefined;
	const request = `
		query ${operationName ?? queryKey}${GQL_PARAMS[queryKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${queryKey}${GQL_ARGS[queryKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
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
	}, [register, dependencyManager, operationName, queryKey, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.
	const response = useQuery<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>(gql(request), options);
	replaceNullValues(response.data);
	return response;
}

export function useLazyTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryTuple<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> {
	const queryKey = typeof key === 'string' ? key : key.queryKey;
	const dataKey = typeof key === 'object' ? key.dataKey : undefined;
	const operationName = typeof key === 'object' ? key.operationName : undefined;
	const request = `
		query ${operationName ?? queryKey}${GQL_PARAMS[queryKey] ?? ""} {
			${dataKey ? dataKey + ": " : ""}${queryKey}${GQL_ARGS[queryKey] ?? ""}${fetcher.toString()}}
		${fetcher.toFragmentString()}
	`;
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
	}, [register, dependencyManager, operationName, queryKey, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.
	const response = useLazyQuery<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>(gql(request), options);
	replaceNullValues(response[1].data);
	return response;
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
