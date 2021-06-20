import {graphQLClient} from '../GraphQLClient';

export async function deleteDepartment(id: number): Promise<number> {
	const gql = `
		mutation($id: Int!) {
			deleteDepartment(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteDepartment'];
	return result as number;
}

