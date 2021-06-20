import {Fetcher, replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {EmployeeFetchable} from '../fetchers';

export async function findEmployees<X extends object>(
	args: FindEmployeesArgs, 
	fetcher: Fetcher<EmployeeFetchable, X>
): Promise<readonly X[]> {
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
	const result = (await graphQLClient().request(gql, args))['findEmployees'];
	replaceNullValues(result);
	return result as readonly X[];
}

/*
 * This argument wrapper type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' or recoil
 */
export type FindEmployeesArgs = {
	readonly namePattern?: string;
	readonly supervisorId?: number;
	readonly departmentId?: number;
}
