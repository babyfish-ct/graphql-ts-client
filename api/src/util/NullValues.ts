/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { produce } from 'immer';

export function removeNullValues<T>(value: T): T {
    removeNullValues0(value);
    return value;
}

function removeNullValues0(value: any) {
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            for (let i = value.length - 1; i >= 0; --i) {
                const childValue = value[i];
                if (childValue === null) {
                    value[i] = undefined;
                } else if (childValue !== undefined) {
                    removeNullValues0(childValue);
                }
            }
        } else {
            for (const fieldName of Object.keys(value)) {
                const childValue = value[fieldName];
                if (childValue === null) {
                    value[fieldName] = undefined;
                } else if (childValue !== undefined) {
                    removeNullValues0(childValue);
                }
            }
        }
    }
}

/**
 * In typescript, undefined is better than null, for example
 * 
 *      interface Itf<T> {
 *          readonly a?: T;
 *          readonly b: T | undefined;
 *          readonly c: T | null;
 *      }
 * 
 * 'b' and 'a' are are compatible, but 'c' and 'a' are not. the code generator of this framwork always generates nullable data like 'a'
 * 
 * This framework processes the response data tree, convert it's null values to undefined, but met some problem when integrates with Apollo
 * 
 * 1. Try to process the returned data of hook, and replace its null values to undefined, Apollo says data object is readonly.
 * 2. Try to use ApolloLink to intercept the reponse and change its data, Apollo says some fields are missing when write object into cache.
 */

export function exceptNullValues<T>(value: T): T {
    if (value === null || value === undefined) {
        return undefined as any as T;
    }
    if (typeof value !== 'object') {
        return value;
    }
    return produce(value, draft => {
        removeNullValues(draft);
    });
}
