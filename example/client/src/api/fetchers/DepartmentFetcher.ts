import { Fetcher } from 'graphql-ts-client-api';

export interface DepartmentFetcher<T> extends Fetcher<T> {

	readonly avgSalary: DepartmentFetcher<T & {readonly avgSalary?: number}>;
	readonly "~avgSalary": DepartmentFetcher<Omit<T, 'avgSalary'>>;

	employees<X>(child: EmployeeFetcher<X>): DepartmentFetcher<T & {readonly employees: X[]}>;
	readonly "~employees": DepartmentFetcher<Omit<T, 'employees'>>;

	readonly id: DepartmentFetcher<T & {readonly id: number}>;
	readonly "~id": DepartmentFetcher<Omit<T, 'id'>>;

	readonly name: DepartmentFetcher<T & {readonly name: string}>;
	readonly "~name": DepartmentFetcher<Omit<T, 'name'>>;
}
