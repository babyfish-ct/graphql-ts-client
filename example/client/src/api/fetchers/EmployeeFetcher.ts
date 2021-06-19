import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import {Gender} from '../enums';
import {DepartmentFetcher} from '.';

export interface EmployeeFetcher<T> extends Fetcher<T> {

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

	department<X>(child: DepartmentFetcher<X>): EmployeeFetcher<T & {readonly department: X}>;
	readonly "~department": EmployeeFetcher<Omit<T, 'department'>>;

	supervisor<X>(child: EmployeeFetcher<X>): EmployeeFetcher<T & {readonly supervisor?: X}>;
	readonly "~supervisor": EmployeeFetcher<Omit<T, 'supervisor'>>;

	subordinates<X>(child: EmployeeFetcher<X>): EmployeeFetcher<T & {readonly subordinates: X[]}>;
	readonly "~subordinates": EmployeeFetcher<Omit<T, 'subordinates'>>;
}

export const employee$ = 
	createFetcher<EmployeeFetcher<{}>>(
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
