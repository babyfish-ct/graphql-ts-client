import {graphQLClient} from '../GraphQLClient';

export async function modifyDepartment(args: ModifyDepartmentArgs): Promise<boolean> {
	const gql = `
		mutation($id: Long!, $name: String!) {
			modifyDepartment(id: $id, name: $name)
		}
	`;
	return await graphQLClient().request(gql, args) as boolean;
}

export interface ModifyDepartmentArgs {
	readonly id: number;
	readonly name: string;
}
