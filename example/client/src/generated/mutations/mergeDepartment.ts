import {graphQLClient} from '../GraphQLClient';
import {DepartmentInput} from '../inputs';

export async function mergeDepartment(input: DepartmentInput): Promise<number> {
	const gql = `
		mutation($input: DepartmentInput!) {
			mergeDepartment(input: $input)
		}
	`;
	const { data, errors } = await graphQLClient().request(gql, {input});
	if (errors !== undefined && errors.length !== 0) {
		throw errors[0];
	}
	return data as number;
}

