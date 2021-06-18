import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';

export async function employee<X>(id: number, fetcher: EmployeeFetcher<X>): Promise<X> {
	const gql = `
		query($id: Long!) {
			employee(id: $id) ${fetcher.toString()}
		}
	`;
	return await graphQLClient().request(gql, {id}) as X;
}

