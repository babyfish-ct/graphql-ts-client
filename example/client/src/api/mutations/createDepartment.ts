import {graphQLClient} from '../GraphQLClient';

export async function createDepartment(name: string): Promise<number> {
	const gql = `
		mutation($name: String!) {
			createDepartment(name: $name)
		}
	`;
	return await graphQLClient().request(gql, {name}) as number;
}

