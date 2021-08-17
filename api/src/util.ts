/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { Md5 } from 'ts-md5';

export function replaceNullValues(value: any) {
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            for (let i = value.length - 1; i >= 0; --i) {
                const childValue = value[i];
                if (childValue === null) {
                    value[i] = undefined;
                } else if (childValue !== undefined) {
                    replaceNullValues(childValue);
                }
            }
        } else {
            for (const fieldName of Object.keys(value)) {
                const childValue = value[fieldName];
                if (childValue === null) {
                    value[fieldName] = undefined;
                } else if (childValue !== undefined) {
                    replaceNullValues(childValue);
                }
            }
        }
    }
}

export function toMd5(value: string): string {
    const md5 = new Md5();
    md5.appendStr(value);
    return md5.end() as string;
}