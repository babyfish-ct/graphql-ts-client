import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';

export async function employee<X>(
	id: number, 
	fetcher: EmployeeFetcher<X>
): Promise<X> {
	const gql = `
		query($id: Long!) {
			employee(id: $id) ${fetcher.toString()}
		}
	`;
	const fetchedObj = await graphQLClient().request(gql, {id});
	replaceNullValues(fetchedObj);
	return fetchedObj as X;
}

