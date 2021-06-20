import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import {EmployeeFetcher} from '.';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface DepartmentFetcher<T extends object> extends Fetcher<T> {

	readonly __typename: DepartmentFetcher<T & {__typename: 'Department'}>;
	readonly "~__typename": DepartmentFetcher<Omit<T, '__typename'>>;

	readonly id: DepartmentFetcher<T & {readonly id: number}>;
	readonly "~id": DepartmentFetcher<Omit<T, 'id'>>;

	readonly name: DepartmentFetcher<T & {readonly name: string}>;
	readonly "~name": DepartmentFetcher<Omit<T, 'name'>>;

	employees<X extends object>(child: EmployeeFetcher<X>): DepartmentFetcher<T & {readonly employees: readonly X[]}>;
	readonly "~employees": DepartmentFetcher<Omit<T, 'employees'>>;

	readonly avgSalary: DepartmentFetcher<T & {readonly avgSalary: number}>;
	readonly "~avgSalary": DepartmentFetcher<Omit<T, 'avgSalary'>>;
}

export const department$ = 
	createFetcher<DepartmentFetcher<{}>>('employees');

export const department$$ = 
	department$
		.id
		.name
	;
