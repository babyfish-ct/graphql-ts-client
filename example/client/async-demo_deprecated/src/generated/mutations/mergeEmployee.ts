import { Fetcher, util } from 'graphql-ts-client-api';
import { graphQLClient } from '../Environment';
import {EmployeeInput} from '../inputs';

export async function mergeEmployee<X extends object>(
	input: EmployeeInput, 
	fetcher: Fetcher<'Employee', X>
): Promise<X> {
	const gql = `
		mutation($input: EmployeeInput!) {
			mergeEmployee(input: $input) ${fetcher.toString()}
		}
		${fetcher.toFragmentString()}
	`;
	const result = (await graphQLClient().request(gql, {input}))['mergeEmployee'];
	util.removeNullValues(result);
	return result as X;
}

