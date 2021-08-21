import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import { WithTypeName, ImplementationType } from '../CommonTypes';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface NodeFetcher<T extends object> extends Fetcher<'Node', T> {

	readonly fetchedEntityType: 'Node';

	readonly __typename: NodeFetcher<T & {__typename: ImplementationType<'Node'>}>;

	on<XName extends ImplementationType<'Node'>, X extends object>(
		child: Fetcher<XName, X>, 
		fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
	): NodeFetcher<
		XName extends 'Node' ?
		T & X :
		WithTypeName<T, ImplementationType<'Node'>> & (
			WithTypeName<X, ImplementationType<XName>> | 
			{__typename: Exclude<ImplementationType<'Node'>, ImplementationType<XName>>}
		)
	>;

	readonly id: NodeFetcher<T & {readonly id: string}>;
	readonly "~id": NodeFetcher<Omit<T, 'id'>>;
}

export const node$: NodeFetcher<{}> = 
	createFetcher(
		createFetchableType(
			"Node", 
			[], 
			["id"]
		), 
		undefined, 
		[]
	)
;

export const node$$ = 
	node$
		.id
;