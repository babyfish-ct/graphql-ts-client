import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {UserFetcher} from '../fetchers';

export async function user<X>(
	token: string, 
	fetcher: UserFetcher<X>
): Promise<X> {
	const gql = `
		query($token: String!) {
			user(token: $token) ${fetcher.toString()}
		}
	`;
	const fetchedObj = await graphQLClient().request(gql, {token});
	replaceNullValues(fetchedObj);
	return fetchedObj as X;
}

