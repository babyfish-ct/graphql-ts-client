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
exports.instancePrefix = exports.isPluralType = exports.associatedTypeOf = void 0;
const graphql_1 = require("graphql");
function associatedTypeOf(type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        return associatedTypeOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLList) {
        return associatedTypeOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType || type instanceof graphql_1.GraphQLUnionType) {
        return type;
    }
    return undefined;
}
exports.associatedTypeOf = associatedTypeOf;
function isPluralType(type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        return isPluralType(type.ofType);
    }
    return type instanceof graphql_1.GraphQLList;
}
exports.isPluralType = isPluralType;
function instancePrefix(name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
exports.instancePrefix = instancePrefix;
