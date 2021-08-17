import { Fetcher, util } from 'graphql-ts-client-api';
import { graphQLClient } from '../Environment';
import {DepartmentInput} from '../inputs';

export async function mergeDepartment<X extends object>(
	input: DepartmentInput, 
	fetcher: Fetcher<'Department', X>
): Promise<X> {
	const gql = `
		mutation($input: DepartmentInput!) {
			mergeDepartment(input: $input) ${fetcher.toString()}
		}
		${fetcher.toFragmentString()}
	`;
	const result = (await graphQLClient().request(gql, {input}))['mergeDepartment'];
	util.removeNullValues(result);
	return result as X;
}

