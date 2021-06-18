import {graphQLClient} from '../GraphQLClient';
import {UserFetcher} from '../fetchers';

export async function user<X>(token: string, fetcher: UserFetcher<X>): Promise<X> {
	const gql = `
		query($token: String!) {
			user(token: $token) ${fetcher.toString()}
		}
	`;
	return await graphQLClient().request(gql, {token}) as X;
}

