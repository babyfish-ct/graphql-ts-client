import { graphQLClient } from '../Environment';

export async function deleteEmployee(id: string): Promise<string> {
	const gql = `
		mutation($id: String!) {
			deleteEmployee(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteEmployee'];
	return result as string;
}

