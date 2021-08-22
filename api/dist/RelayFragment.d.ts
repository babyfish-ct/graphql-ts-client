import { Fetcher } from "./Fetcher";
export declare class RelayFragment<E extends string, T extends object> {
    readonly fragmentName: string;
    readonly fetcher: Fetcher<E, object>;
    private constructor();
    static create<E extends string, T extends object>(fragmentName: string, fetcher: Fetcher<E, T>): RelayFragment<E, T>;
}
