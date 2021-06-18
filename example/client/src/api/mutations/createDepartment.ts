import {graphQLClient} from '../GraphQLClient';

export async function createDepartment(name: string): Promise<number> {
	const gql = `
		mutation createDepartment($name: String!)
	`;
	return await graphQLClient().request(gql, {name}) as number;
}

