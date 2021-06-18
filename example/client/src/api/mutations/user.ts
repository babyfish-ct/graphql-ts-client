import {graphQLClient} from '../GraphQLClient';
import {UserFetcher} from '../fetchers';

export async function user<X>(token: string, fetcher: UserFetcher<X>): Promise<X> {
	const gql = `
		mutation user($token: String!) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql) as X;
}

