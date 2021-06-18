import {graphQLClient} from '../GraphQLClient';

export async function deleteDepartment(id: number): Promise<boolean> {
	const gql = `
		mutation deleteDepartment($id: Long!)
	`;
	return await graphQLClient().request(gql, {id}) as boolean;
}

