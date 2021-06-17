import { Fetcher } from 'graphql-ts-client-api';

export interface LoginResultFetcher<T> extends Fetcher<T> {

	readonly token: LoginResultFetcher<T & {readonly token: string}>;
	readonly "~token": LoginResultFetcher<Omit<T, 'token'>>;

	user<X>(child: UserFetcher<X>): LoginResultFetcher<T & {readonly user: X}>;
	readonly "~user": LoginResultFetcher<Omit<T, 'user'>>;
}
