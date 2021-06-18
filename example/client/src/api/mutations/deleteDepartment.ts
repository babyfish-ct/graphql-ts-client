import {graphQLClient} from '../GraphQLClient';

export async function deleteDepartment(id: number): Promise<boolean> {
	const gql = `
		mutation($id: Long!) {
			deleteDepartment(id: $id)
		}
	`;
	return await graphQLClient().request(gql, {id}) as boolean;
}

