import {graphQLClient} from '../GraphQLClient';
import {EmployeeInput} from '../inputs';

export async function modifyEmployee(args: ModifyEmployeeArgs): Promise<boolean> {
	const gql = `
		mutation modifyEmployee($id: Long!, $input: EmployeeInput!)
	`;
	return await graphQLClient().request(gql, args) as boolean;
}

export interface ModifyEmployeeArgs {}
