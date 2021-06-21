import {graphQLClient} from '../Environment';
import {EmployeeInput} from '../inputs';

export async function mergeEmployee(input: EmployeeInput): Promise<number> {
	const gql = `
		mutation($input: EmployeeInput!) {
			mergeEmployee(input: $input)
		}
	`;
	const result = (await graphQLClient().request(gql, {input}))['mergeEmployee'];
	return result as number;
}

