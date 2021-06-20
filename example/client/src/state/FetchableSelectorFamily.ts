import { GetRecoilValue, RecoilValue, RecoilValueReadOnly, selectorFamily, SerializableParam } from "recoil";
import { Fetcher } from 'graphql-ts-client-api';

export function fetchableSelectorFamily<
    P extends SerializableParam,
    A
>(
    options: FetchableSelectorFamilyOptions<P, A>
): FetchableFamily<P, A> {
    const recoilFamily = selectorFamily<any, {param: P, fetcher: Fetcher<A, any>}>({
        key: options.key,
        get: p => async(opts: { get: GetRecoilValue }) => {
            const {param, fetcher} = p; 
            return options.get(param, fetcher);
        },
        dangerouslyAllowMutability: options.dangerouslyAllowMutability
    });
    return <T extends object, F extends Fetcher<A, T>>(param: P, fetcher: F) => {
        return recoilFamily({param, fetcher});
    };
}

export interface FetchableSelectorFamilyOptions<P extends SerializableParam, A> {
    readonly key: string;
    readonly get: FetchableGetter<P, A>;
    readonly dangerouslyAllowMutability?: boolean;
}

export type FetchableFamily<
    P extends SerializableParam,
    A
> = <
    T extends object, 
    F extends Fetcher<A, T>
>(p: P, fetcher: F) => RecoilValueReadOnly<T>

export type FetchableGetter<
    P extends SerializableParam,
    A
> = <
    T extends object, 
    F extends Fetcher<A, T>
>(param: P, fetcher: F) => (opts: { get: GetRecoilValue }) => Promise<T> | RecoilValue<T> | T;
