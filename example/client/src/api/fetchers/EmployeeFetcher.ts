import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import {DepartmentFetcher} from '.';
import {Gender} from '../enums';

export interface EmployeeFetcher<T> extends Fetcher<T> {

	department<X>(child: DepartmentFetcher<X>): EmployeeFetcher<T & {readonly department: X}>;
	readonly "~department": EmployeeFetcher<Omit<T, 'department'>>;

	readonly gender: EmployeeFetcher<T & {readonly gender: Gender}>;
	readonly "~gender": EmployeeFetcher<Omit<T, 'gender'>>;

	readonly id: EmployeeFetcher<T & {readonly id: number}>;
	readonly "~id": EmployeeFetcher<Omit<T, 'id'>>;

	readonly name: EmployeeFetcher<T & {readonly name: string}>;
	readonly "~name": EmployeeFetcher<Omit<T, 'name'>>;

	readonly salary: EmployeeFetcher<T & {readonly salary?: number}>;
	readonly "~salary": EmployeeFetcher<Omit<T, 'salary'>>;

	subordinates<X>(child: EmployeeFetcher<X>): EmployeeFetcher<T & {readonly subordinates: X[]}>;
	readonly "~subordinates": EmployeeFetcher<Omit<T, 'subordinates'>>;

	supervisor<X>(child: EmployeeFetcher<X>): EmployeeFetcher<T & {readonly supervisor?: X}>;
	readonly "~supervisor": EmployeeFetcher<Omit<T, 'supervisor'>>;
}

export const employee$ = createFetcher<EmployeeFetcher<{}>>('department', 'subordinates', 'supervisor');

export const employee$$ = employee$
	.gender
	.id
	.name
	.salary
;
