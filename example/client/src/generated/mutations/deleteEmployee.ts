import {graphQLClient} from '../GraphQLClient';

export async function deleteEmployee(id: number): Promise<number> {
	const gql = `
		mutation($id: Int!) {
			deleteEmployee(id: $id)
		}
	`;
	const { data, errors } = await graphQLClient().request(gql, {id});
	if (errors !== undefined && errors.length !== 0) {
		throw errors[0];
	}
	return data as number;
}

