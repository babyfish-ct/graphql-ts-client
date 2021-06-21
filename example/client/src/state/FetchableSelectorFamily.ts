/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */




/****************************************************************************

This is an experimental functionality,
that's why it's is declared here, not in the 'graphql-ts-client-api'.
You can copy this file into your project it's helpful for you

'graphql-ts-client' infers type of returned by strongly type graphql query,
different queries return data with different types.

'selectorFamily' of 'recoil' returns fixed type, 
no matter what type of parameter is passed in.

'graphql-ts-client' supports three wapper functions base on 'selectorFamily',
you can use them when the last argument of query/mutation is Fetcher.

Comparsion:

+----------------------------------+-----------------------------------------------------------+
| Function                         | Signature                                                 |
+----------------------------------+-----------------------------------------------------------+
| selectorFamily                   | <P>(param: P) => Fixed type                               |
|                                  |                                                           |
| fetchableSelectorFamily.required | <P, T>(param: P, fetcher: Fetcher<?, T>) => T             |
| fetchableSelectorFamily.optional | <P, T>(param: P, fetcher: Fetcher<?, T>) => T | undefined |
| fetchableSelectorFamily.list     | <P, T>(param: P, fetcher: Fetcher<?, T>) => readonly T[]  |
+----------------------------------+-----------------------------------------------------------+

****************************************************************************/


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
