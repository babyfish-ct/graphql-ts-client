import {replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetcher} from '../fetchers';

export async function findEmployees<X>(
	args: FindEmployeesArgs, 
	fetcher: EmployeeFetcher<X>
): Promise<X> {
	const gql = `
		query(
			$namePattern: String, 
			$supervisorId: Int, 
			$departmentId: Int
		) {
			findEmployees(
				namePattern: $namePattern, 
				supervisorId: $supervisorId, 
				departmentId: $departmentId
			) ${fetcher.toString()}
		}
	`;
	const { data, errors } = await graphQLClient().request(gql, args);
	if (errors !== undefined && errors.length !== 0) {
		throw errors[0];
	}
	replaceNullValues(data);
	return data as X;
}

export interface FindEmployeesArgs {
	readonly namePattern?: string;
	readonly supervisorId?: number;
	readonly departmentId?: number;
}
