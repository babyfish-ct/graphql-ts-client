import {graphQLClient} from '../Environment';

export async function deleteDepartment(id: number): Promise<boolean> {
	const gql = `
		mutation($id: Int!) {
			deleteDepartment(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteDepartment'];
	return result as boolean;
}

