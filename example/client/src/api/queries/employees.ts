import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';
import {EmployeeCriteriaInput} from '../inputs';
import {EmployeeSortedType} from '../enums';

export async function employees<X>(args: EmployeesArgs, fetcher: EmployeeFetcher<X>): Promise<X> {
	const gql = `
		query employees(
			$criteria: EmployeeCriteriaInput, 
			$descending: Boolean, 
			$limit: Int, 
			$offset: Int, 
			$sortedType: EmployeeSortedType
		) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql, args) as X;
}

export interface EmployeesArgs {}
