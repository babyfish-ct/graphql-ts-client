import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {DepartmentFetcher} from '../fetchers';
import {DepartmentSortedType} from '../enums';

export async function departments<X>(
	args: DepartmentsArgs, 
	fetcher: DepartmentFetcher<X>
): Promise<X> {
	const gql = `
		query(
			$descending: Boolean, 
			$limit: Int, 
			$name: String, 
			$offset: Int, 
			$sortedType: DepartmentSortedType
		) {
			departments(
				descending: $descending, 
				limit: $limit, 
				name: $name, 
				offset: $offset, 
				sortedType: $sortedType
			) ${fetcher.toString()}
		}
	`;
	const fetchedObj = await graphQLClient().request(gql, args);
	replaceNullValues(fetchedObj);
	return fetchedObj as X;
}

export interface DepartmentsArgs {
	readonly descending?: boolean;
	readonly limit?: number;
	readonly name?: string;
	readonly offset?: number;
	readonly sortedType?: DepartmentSortedType;
}
