import {graphQLClient} from '../Environment';

export async function deleteDepartment(id: string): Promise<boolean> {
	const gql = `
		mutation($id: String!) {
			deleteDepartment(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteDepartment'];
	return result as boolean;
}

