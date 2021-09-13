/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLSchema } from 'graphql';
import { buildSchema, getIntrospectionQuery } from 'graphql/utilities';
import { buildClientSchema } from 'graphql/utilities';
import fetch from 'node-fetch';

export async function loadRemoteSchema(
    endpoint: string,
    headers?: { [key: string]: string }
): Promise<GraphQLSchema> {
    const body = JSON.stringify({"query": getIntrospectionQuery()});
    const response = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body).toString(),
            ...headers
        }
    });
    const {data, errors} = await response.json();
    if (errors !== undefined) {
        throw new Error();
    }
    return buildClientSchema(data);
}

export function loadLocalSchema(
    sdl: string
): GraphQLSchema {
    return buildSchema(sdl);
}
