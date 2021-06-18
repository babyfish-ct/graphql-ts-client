import {graphQLClient} from '../GraphQLClient';
import {LoginResultFetcher} from '../fetchers';

export async function login<X>(args: LoginArgs, fetcher: LoginResultFetcher<X>): Promise<X> {
	const gql = `
		query login($loginName: String!, $password: String!) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql, args) as X;
}

export interface LoginArgs {}
