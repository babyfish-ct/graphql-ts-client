import {graphQLClient} from '../GraphQLClient';
import {LoginResultFetcher} from '../fetchers';

export async function login<X>(args: LoginArgs, fetcher: LoginResultFetcher<X>): Promise<X> {
	const gql = `
		query($loginName: String!, $password: String!) {
			login(loginName: $loginName, password: $password) ${fetcher.toString()}
		}
	`;
	return await graphQLClient().request(gql, args) as X;
}

export interface LoginArgs {
	readonly loginName: string;
	readonly password: string;
}
