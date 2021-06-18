import {graphQLClient} from '../GraphQLClient';

export async function deleteEmployee(id: number): Promise<boolean> {
	const gql = `
		mutation($id: Long!) {
			deleteEmployee(id: $id)
		}
	`;
	return await graphQLClient().request(gql, {id}) as boolean;
}

