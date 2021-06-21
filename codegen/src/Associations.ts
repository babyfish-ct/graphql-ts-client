/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";

export function associatedTypesOf(type: GraphQLType): Array<GraphQLObjectType | GraphQLInterfaceType> {
    if (type instanceof GraphQLNonNull) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof GraphQLList) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
        return [type];
    }
    if (type instanceof GraphQLUnionType) {
        return type.getTypes();
    }
    return [];
}