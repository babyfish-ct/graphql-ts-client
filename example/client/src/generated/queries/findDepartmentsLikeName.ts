import {Fetcher, replaceNullValues} from 'graphql-ts-client-api';
import {graphQLClient} from '../Environment';

export async function findDepartmentsLikeName<X extends object>(
	name: string | undefined, 
	fetcher: Fetcher<'Department', X>
): Promise<readonly X[]> {
	const gql = `
		query($name: String) {
			findDepartmentsLikeName(name: $name) ${fetcher.toString()}
		}
		${fetcher.toFragmentString()}
	`;
	const result = (await graphQLClient().request(gql, {name}))['findDepartmentsLikeName'];
	replaceNullValues(result);
	return result as readonly X[];
}

