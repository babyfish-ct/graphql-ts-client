/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
export declare function associatedTypeOf(type: GraphQLType): GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | undefined;
export declare function isPluralType(type: GraphQLType): any;
