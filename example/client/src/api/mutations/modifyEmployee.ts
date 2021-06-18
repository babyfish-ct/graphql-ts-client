import {graphQLClient} from '../GraphQLClient';
import {EmployeeInput} from '../inputs';

export async function modifyEmployee(args: ModifyEmployeeArgs): Promise<boolean> {
	const gql = `
		mutation($id: Long!, $input: EmployeeInput!) {
			modifyEmployee(id: $id, input: $input)
		}
	`;
	return await graphQLClient().request(gql, args) as boolean;
}

export interface ModifyEmployeeArgs {
	readonly id: number;
	readonly input: EmployeeInput;
}
