"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.associatedTypesOf = void 0;
const graphql_1 = require("graphql");
function associatedTypesOf(type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLList) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
        return [type];
    }
    if (type instanceof graphql_1.GraphQLUnionType) {
        return type.getTypes();
    }
    return [];
}
exports.associatedTypesOf = associatedTypesOf;
