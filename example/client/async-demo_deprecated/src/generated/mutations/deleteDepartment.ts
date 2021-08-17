import { graphQLClient } from '../Environment';

export async function deleteDepartment(id: string): Promise<string> {
	const gql = `
		mutation($id: String!) {
			deleteDepartment(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteDepartment'];
	return result as string;
}

