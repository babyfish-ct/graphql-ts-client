import { Fetcher, createFetcher } from 'graphql-ts-client-api';
import {UserFetcher} from '.';

export interface LoginResultFetcher<T> extends Fetcher<T> {

	readonly token: LoginResultFetcher<T & {readonly token: string}>;
	readonly "~token": LoginResultFetcher<Omit<T, 'token'>>;

	user<X>(child: UserFetcher<X>): LoginResultFetcher<T & {readonly user: X}>;
	readonly "~user": LoginResultFetcher<Omit<T, 'user'>>;
}

export const loginResult$ = createFetcher<LoginResultFetcher<{}>>('user');

export const loginResult$$ = loginResult$
	.token
;
