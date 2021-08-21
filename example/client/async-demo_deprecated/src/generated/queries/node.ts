import { Fetcher, util } from 'graphql-ts-client-api';
import { graphQLClient } from '../Environment';

export async function node<X extends object>(
	id: number, 
	fetcher: Fetcher<'Node', X>
): Promise<X> {
	const gql = `
		query($id: ID!) {
			node(id: $id) ${fetcher.toString()}
		}
		${fetcher.toFragmentString()}
	`;
	const result = (await graphQLClient().request(gql, {id}))['node'];
	util.removeNullValues(result);
	return result as X;
}

