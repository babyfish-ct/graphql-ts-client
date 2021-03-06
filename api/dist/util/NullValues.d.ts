/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
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
export declare function exceptNullValues<T>(value: T): T;
