import { Fetcher } from './Fetcher';
export declare function createFetcher<A, F extends Fetcher<A, object>>(...methodNames: string[]): F;
