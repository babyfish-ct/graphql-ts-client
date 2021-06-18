import {graphQLClient} from '../GraphQLClient';
import {EmployeeCriteriaInput} from '../inputs';

export async function employeeCount(criteria?: EmployeeCriteriaInput): Promise<number> {
	const gql = `
		query($criteria: EmployeeCriteriaInput) {
			employeeCount(criteria: $criteria)
		}
	`;
	return await graphQLClient().request(gql, {criteria}) as number;
}

