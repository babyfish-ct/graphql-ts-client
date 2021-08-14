import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import { WithTypeName, ImplementationType } from '../CommonTypes';
import {Gender} from '../enums';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface EmployeeFetcher<T extends object> extends Fetcher<'Employee', T> {

	readonly fetchedEntityType: 'Employee';

	readonly __typename: EmployeeFetcher<T & {__typename: ImplementationType<'Employee'>}>;

	on<XName extends ImplementationType<'Employee'>, X extends object>(child: Fetcher<XName, X>): EmployeeFetcher<
		XName extends 'Employee' ?
		T & X :
		WithTypeName<T, ImplementationType<'Employee'>> & (
			WithTypeName<X, ImplementationType<XName>> | 
			{__typename: Exclude<ImplementationType<'Employee'>, ImplementationType<XName>>}
		)
	>;

	asFragment(name: string): Fetcher<'Employee', T>;

	readonly id: EmployeeFetcher<T & {readonly id: string}>;
	readonly "~id": EmployeeFetcher<Omit<T, 'id'>>;

	readonly firstName: EmployeeFetcher<T & {readonly firstName: string}>;
	readonly "~firstName": EmployeeFetcher<Omit<T, 'firstName'>>;

	readonly lastName: EmployeeFetcher<T & {readonly lastName: string}>;
	readonly "~lastName": EmployeeFetcher<Omit<T, 'lastName'>>;

	readonly gender: EmployeeFetcher<T & {readonly gender: Gender}>;
	readonly "~gender": EmployeeFetcher<Omit<T, 'gender'>>;

	readonly salary: EmployeeFetcher<T & {readonly salary: number}>;
	readonly "~salary": EmployeeFetcher<Omit<T, 'salary'>>;

	department<X extends object>(child: Fetcher<'Department', X>): EmployeeFetcher<T & {readonly department: X}>;
	readonly "~department": EmployeeFetcher<Omit<T, 'department'>>;

	supervisor<X extends object>(child: Fetcher<'Employee', X>): EmployeeFetcher<T & {readonly supervisor?: X}>;
	readonly "~supervisor": EmployeeFetcher<Omit<T, 'supervisor'>>;

	subordinates<X extends object>(child: Fetcher<'Employee', X>): EmployeeFetcher<T & {readonly subordinates: readonly X[]}>;
	readonly "~subordinates": EmployeeFetcher<Omit<T, 'subordinates'>>;
}

export const employee$: EmployeeFetcher<{}> = 
	createFetcher(
		'Employee', 
		undefined, 
		[
			'department', 
			'supervisor', 
			'subordinates'
		]
	)
;

export const employee$$ = 
	employee$
		.id
		.firstName
		.lastName
		.gender
		.salary
;