import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {DepartmentFetcher} from '../fetchers';

export async function department<X>(
	id: number, 
	fetcher: DepartmentFetcher<X>
): Promise<X> {
	const gql = `
		query($id: Long!) {
			department(id: $id) ${fetcher.toString()}
		}
	`;
	const fetchedObj = await graphQLClient().request(gql, {id});
	replaceNullValues(fetchedObj);
	return fetchedObj as X;
}

