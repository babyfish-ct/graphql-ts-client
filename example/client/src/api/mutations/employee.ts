import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';

export async function employee<X>(id: number, fetcher: EmployeeFetcher<X>): Promise<X> {
	const gql = `
		mutation employee($id: Long!) ${fetcher.toString()}
	`;
	return await graphQLClient().request(gql) as X;
}

