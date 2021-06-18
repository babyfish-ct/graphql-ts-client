import {graphQLClient} from '../GraphQLClient';

export async function modifyDepartment(args: ModifyDepartmentArgs): Promise<boolean> {
	const gql = `
		mutation modifyDepartment($id: Long!, $name: String!)
	`;
	return await graphQLClient().request(gql, args) as boolean;
}

export interface ModifyDepartmentArgs {}
