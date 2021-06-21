import {graphQLClient} from '../Environment';

export async function deleteEmployee(id: number): Promise<number> {
	const gql = `
		mutation($id: Int!) {
			deleteEmployee(id: $id)
		}
	`;
	const result = (await graphQLClient().request(gql, {id}))['deleteEmployee'];
	return result as number;
}

