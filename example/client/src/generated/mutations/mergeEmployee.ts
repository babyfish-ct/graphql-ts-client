import {graphQLClient} from '../GraphQLClient';
import {EmployeeInput} from '../inputs';

export async function mergeEmployee(input: EmployeeInput): Promise<number> {
	const gql = `
		mutation($input: EmployeeInput!) {
			mergeEmployee(input: $input)
		}
	`;
	const { data, errors } = await graphQLClient().request(gql, {input});
	if (errors !== undefined && errors.length !== 0) {
		throw errors[0];
	}
	return data as number;
}

