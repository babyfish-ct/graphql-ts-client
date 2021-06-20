import {Fetcher, replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../GraphQLClient';
import {DepartmentFetchable} from '../fetchers';

export async function findDepartmentsLikeName<X extends object>(
	name: string | undefined, 
	fetcher: Fetcher<DepartmentFetchable, X>
): Promise<X> {
	const gql = `
		query($name: String) {
			findDepartmentsLikeName(name: $name) ${fetcher.toString()}
		}
	`;
	const { data, errors } = await graphQLClient().request(gql, {name});
	if (errors !== undefined && errors.length !== 0) {
		throw errors[0];
	}
	replaceNullValues(data);
	return data as X;
}

