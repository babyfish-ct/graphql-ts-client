import { Fetcher } from './Fetcher';
export declare function createFetcher<F extends Fetcher<{}>>(...methodNames: string[]): F;
