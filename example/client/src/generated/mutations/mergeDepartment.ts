import {graphQLClient} from '../Environment';
import {DepartmentInput} from '../inputs';

export async function mergeDepartment(input: DepartmentInput): Promise<number> {
	const gql = `
		mutation($input: DepartmentInput!) {
			mergeDepartment(input: $input)
		}
	`;
	const result = (await graphQLClient().request(gql, {input}))['mergeDepartment'];
	return result as number;
}

