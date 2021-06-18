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