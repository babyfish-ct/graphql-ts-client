import {graphQLClient} from '../GraphQLClient';

export async function deleteEmployee(id: number): Promise<boolean> {
	const gql = `
		mutation deleteEmployee($id: Long!)
	`;
	return await graphQLClient().request(gql, {id}) as boolean;
}

