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
import { GeneratorConfig } from "./GeneratorConfig";

export function targetTypeOf(type: GraphQLType): GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | undefined {
    if (type instanceof GraphQLNonNull) {
        return targetTypeOf(type.ofType);
    }
    if (type instanceof GraphQLList) {
        return targetTypeOf(type.ofType);
    }
    if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType || type instanceof GraphQLUnionType) {
        return type;
    }
    return undefined;
}

export function instancePrefix(name: string): string {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}

export function isExecludedTypeName(config: GeneratorConfig, typeName: string | undefined) {
    if (typeName == undefined) {
        return false;
    }
    const list = config.excludedTypes;
    return list !== undefined && list.findIndex(v => v == typeName) !== -1;
}