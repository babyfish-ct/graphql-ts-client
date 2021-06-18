import {graphQLClient} from '../GraphQLClient';

export async function departmentCount(name?: string): Promise<number> {
	const gql = `
		mutation departmentCount($name: String)
	`;
	return await graphQLClient().request(gql) as number;
}

