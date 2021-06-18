import {graphQLClient} from '../GraphQLClient';
import {DepartmentFetcher} from '../fetchers';

export async function department<X>(id: number, fetcher: DepartmentFetcher<X>): Promise<X> {
	const gql = `
		mutation department($id: Long!) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql) as X;
}

