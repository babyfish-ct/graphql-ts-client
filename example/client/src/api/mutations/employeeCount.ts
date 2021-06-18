import {graphQLClient} from '../GraphQLClient';
import {EmployeeCriteriaInput} from '../inputs';

export async function employeeCount(criteria?: EmployeeCriteriaInput): Promise<number> {
	const gql = `
		mutation employeeCount($criteria: EmployeeCriteriaInput)
	`;
	return await graphQLClient().request(gql) as number;
}

