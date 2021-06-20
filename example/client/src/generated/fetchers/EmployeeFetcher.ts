import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import {Gender} from '../enums';
import {DepartmentFetchable} from '.';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface EmployeeFetcher<T extends object> extends Fetcher<EmployeeFetchable, T> {

	readonly __typename: EmployeeFetcher<T & {__typename: 'Employee'}>;
	readonly "~__typename": EmployeeFetcher<Omit<T, '__typename'>>;

	readonly id: EmployeeFetcher<T & {readonly id: number}>;
	readonly "~id": EmployeeFetcher<Omit<T, 'id'>>;

	readonly firstName: EmployeeFetcher<T & {readonly firstName: string}>;
	readonly "~firstName": EmployeeFetcher<Omit<T, 'firstName'>>;

	readonly lastName: EmployeeFetcher<T & {readonly lastName: string}>;
	readonly "~lastName": EmployeeFetcher<Omit<T, 'lastName'>>;

	readonly gender: EmployeeFetcher<T & {readonly gender: Gender}>;
	readonly "~gender": EmployeeFetcher<Omit<T, 'gender'>>;

	readonly salary: EmployeeFetcher<T & {readonly salary: number}>;
	readonly "~salary": EmployeeFetcher<Omit<T, 'salary'>>;

	department<X extends object>(child: Fetcher<DepartmentFetchable, X>): EmployeeFetcher<T & {readonly department: X}>;
	readonly "~department": EmployeeFetcher<Omit<T, 'department'>>;

	supervisor<X extends object>(child: Fetcher<EmployeeFetchable, X>): EmployeeFetcher<T & {readonly supervisor?: X}>;
	readonly "~supervisor": EmployeeFetcher<Omit<T, 'supervisor'>>;

	subordinates<X extends object>(child: Fetcher<EmployeeFetchable, X>): EmployeeFetcher<T & {readonly subordinates: readonly X[]}>;
	readonly "~subordinates": EmployeeFetcher<Omit<T, 'subordinates'>>;
}

export interface EmployeeFetchable {
	readonly type: 'Employee';
}

export const employee$: EmployeeFetcher<{}> = 
	createFetcher(
		'department', 
		'supervisor', 
		'subordinates'
	);

export const employee$$ = 
	employee$
		.id
		.firstName
		.lastName
		.gender
		.salary
	;
