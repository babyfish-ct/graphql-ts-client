import {graphQLClient} from '../GraphQLClient';

export async function departmentCount(name?: string): Promise<number> {
	const gql = `
		query($name: String) {
			departmentCount(name: $name)
		}
	`;
	return await graphQLClient().request(gql, {name}) as number;
}

