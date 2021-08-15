import {graphQLClient} from '../Environment';

export async function deleteEmployee(id: string): Promise<boolean> {
	const gql = `
		mutation($id: String!) {
			deleteEmployee(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteEmployee'];
	return result as boolean;
}

