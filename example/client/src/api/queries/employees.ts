import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';
import {EmployeeCriteriaInput} from '../inputs';
import {EmployeeSortedType} from '../enums';

export async function employees<X>(
	args: EmployeesArgs, 
	fetcher: EmployeeFetcher<X>
): Promise<X> {
	const gql = `
		query(
			$criteria: EmployeeCriteriaInput, 
			$descending: Boolean, 
			$limit: Int, 
			$offset: Int, 
			$sortedType: EmployeeSortedType
		) {
			employees(
				criteria: $criteria, 
				descending: $descending, 
				limit: $limit, 
				offset: $offset, 
				sortedType: $sortedType
			) ${fetcher.toString()}
		}
	`;
	const fetchedObj = await graphQLClient().request(gql, args);
	replaceNullValues(fetchedObj);
	return fetchedObj as X;
}

export interface EmployeesArgs {
	readonly criteria?: EmployeeCriteriaInput;
	readonly descending?: boolean;
	readonly limit?: number;
	readonly offset?: number;
	readonly sortedType?: EmployeeSortedType;
}
