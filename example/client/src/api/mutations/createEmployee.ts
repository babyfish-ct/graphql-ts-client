import {graphQLClient} from '../GraphQLClient';
import {EmployeeInput} from '../inputs';

export async function createEmployee(input: EmployeeInput): Promise<number> {
	const gql = `
		mutation createEmployee($input: EmployeeInput!)
	`;
	return await graphQLClient().request(gql, {input}) as number;
}

