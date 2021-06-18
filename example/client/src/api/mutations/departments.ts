import {graphQLClient} from '../GraphQLClient';
import {DepartmentFetcher} from '../fetchers';
import {DepartmentSortedType} from '../enums';

export async function departments<X>(args: DepartmentsArgs, fetcher: DepartmentFetcher<X>): Promise<X> {
	const gql = `
		mutation departments(
			$descending: Boolean, 
			$limit: Int, 
			$name: String, 
			$offset: Int, 
			$sortedType: DepartmentSortedType
		) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql) as X;
}

export interface DepartmentsArgs {}
