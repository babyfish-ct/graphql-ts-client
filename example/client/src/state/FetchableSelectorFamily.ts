import { GetRecoilValue, RecoilValue, RecoilValueReadOnly, selectorFamily, SerializableParam } from "recoil";
import { Fetcher } from 'graphql-ts-client-api';

export const fetchableSelectorFamily = {
    required,
    optional,
    list
};

function required<
    A,
    P extends SerializableParam,
>(
    options: {
        key: string;
        get: <
            T extends object
        >(
            p: P, fetcher: Fetcher<A, T>
        ) => (
            opts: { get: GetRecoilValue }
        ) => Promise<T> | RecoilValue<T> | T
        dangerouslyAllowMutability?: boolean
    }
): <
    T extends object
>(p: P, fetcher: Fetcher<A, T>) => RecoilValueReadOnly<T> {
    const recoilFamily = selectorFamily<any, {param: P, fetcher: Fetcher<A, any>}>({
        key: options.key,
        get: p => (opts: { get: GetRecoilValue }) => {
            const {param, fetcher} = p; 
            return options.get(param, fetcher)(opts);
        },
        dangerouslyAllowMutability: options.dangerouslyAllowMutability
    });
    return <T extends object>(param: P, fetcher: Fetcher<A, T>) => {
        return recoilFamily({param, fetcher});
    };
}

function optional<
    A,
    P extends SerializableParam,
>(
    options: {
        key: string;
        get: <
            T extends object
        >(
            p: P, fetcher: Fetcher<A, T>
        ) => (
            opts: { get: GetRecoilValue }
        ) => Promise<T | undefined> | RecoilValue<T | undefined> | T | undefined
        dangerouslyAllowMutability?: boolean
    }
): <
    T extends object
>(p: P, fetcher: Fetcher<A, T>) => RecoilValueReadOnly<T | undefined> {
    const recoilFamily = selectorFamily<any, {param: P, fetcher: Fetcher<A, any>}>({
        key: options.key,
        get: p => (opts: { get: GetRecoilValue }) => {
            const {param, fetcher} = p; 
            return options.get(param, fetcher)(opts);
        },
        dangerouslyAllowMutability: options.dangerouslyAllowMutability
    });
    return <T extends object>(param: P, fetcher: Fetcher<A, T>) => {
        return recoilFamily({param, fetcher});
    };
}

function list<
    A,
    P extends SerializableParam,
>(
    options: {
        key: string;
        get: <
            T extends object
        >(
            p: P, fetcher: Fetcher<A, T>
        ) => (
            opts: { get: GetRecoilValue }
        ) => Promise<readonly T[]> | RecoilValue<readonly T[]> | readonly T[]
        dangerouslyAllowMutability?: boolean
    }
): <
    T extends object
>(p: P, fetcher: Fetcher<A, T>) => RecoilValueReadOnly<readonly T[]> {
    const recoilFamily = selectorFamily<any, {param: P, fetcher: Fetcher<A, any>}>({
        key: options.key,
        get: p => (opts: { get: GetRecoilValue }) => {
            const {param, fetcher} = p; 
            return options.get(param, fetcher)(opts);
        },
        dangerouslyAllowMutability: options.dangerouslyAllowMutability
    });
    return <T extends object>(param: P, fetcher: Fetcher<A, T>) => {
        return recoilFamily({param, fetcher});
    };
}
