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
 
export function toMd5(value: string): string {
    const md5 = new Md5();
    md5.appendStr(value);
    return md5.end() as string;
}