import {graphQLClient} from '../GraphQLClient';
import {LoginResultFetcher} from '../fetchers';

export async function login<X>(args: LoginArgs, fetcher: LoginResultFetcher<X>): Promise<X> {
	const gql = `
		mutation login($loginName: String!, $password: String!) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql) as X;
}

export interface LoginArgs {}
