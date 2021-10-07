import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLType, GraphQLUnionType } from "graphql";
import { InheritanceInfo } from "./InheritanceInfo";
export interface FetcherContext {
    readonly schema: GraphQLSchema;
    readonly inheritanceInfo: InheritanceInfo;
    readonly fetcherTypes: ReadonlyArray<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType>;
    readonly connectionTypes: Map<GraphQLType, Connection>;
    readonly edgeTypes: Set<GraphQLType>;
    readonly idFieldMap: Map<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, GraphQLField<any, any>>;
}
export interface Connection {
    readonly edgeType: GraphQLObjectType | GraphQLInterfaceType;
    readonly nodeType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
}
