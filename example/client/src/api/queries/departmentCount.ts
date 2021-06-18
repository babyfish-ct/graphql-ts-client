import {graphQLClient} from '../GraphQLClient';

export async function departmentCount(name?: string): Promise<number> {
	const gql = `
		query departmentCount($name: String)
	`;
	return await graphQLClient().request(gql, {name}) as number;
}

