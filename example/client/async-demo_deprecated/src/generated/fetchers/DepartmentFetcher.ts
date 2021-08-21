import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import { WithTypeName, ImplementationType } from '../CommonTypes';
import { node$ } from './NodeFetcher';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface DepartmentFetcher<T extends object> extends Fetcher<'Department', T> {

	readonly fetchedEntityType: 'Department';

	readonly __typename: DepartmentFetcher<T & {__typename: ImplementationType<'Department'>}>;

	on<XName extends ImplementationType<'Department'>, X extends object>(child: Fetcher<XName, X>): DepartmentFetcher<
		XName extends 'Department' ?
		T & X :
		WithTypeName<T, ImplementationType<'Department'>> & (
			WithTypeName<X, ImplementationType<XName>> | 
			{__typename: Exclude<ImplementationType<'Department'>, ImplementationType<XName>>}
		)
	>;

	asFragment(name: string): Fetcher<'Department', T>;

	readonly id: DepartmentFetcher<T & {readonly id: number}>;
	readonly "~id": DepartmentFetcher<Omit<T, 'id'>>;

	readonly name: DepartmentFetcher<T & {readonly name: string}>;
	readonly "~name": DepartmentFetcher<Omit<T, 'name'>>;

	employees<X extends object>(child: Fetcher<'Employee', X>): DepartmentFetcher<T & {readonly employees: readonly X[]}>;
	readonly "~employees": DepartmentFetcher<Omit<T, 'employees'>>;

	readonly avgSalary: DepartmentFetcher<T & {readonly avgSalary: number}>;
	readonly "~avgSalary": DepartmentFetcher<Omit<T, 'avgSalary'>>;
}

export const department$: DepartmentFetcher<{}> = 
	createFetcher(
		createFetchableType(
			"Department", 
			[node$.fetchableType], 
			["name", "employees", "avgSalary"]
		), 
		undefined, 
		['employees']
	)
;

export const department$$ = 
	department$
		.id
		.name
;