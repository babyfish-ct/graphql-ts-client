import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLType, GraphQLUnionType } from "graphql";
import { InheritanceInfo } from "./InheritanceInfo";
export interface FetcherContext {
    readonly schema: GraphQLSchema;
    readonly inheritanceInfo: InheritanceInfo;
    readonly fetcherTypes: ReadonlyArray<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType>;
    readonly entityTypes: ReadonlySet<GraphQLType>;
    readonly embeddedTypes: ReadonlySet<GraphQLType>;
    readonly connections: ReadonlyMap<GraphQLType, Connection>;
    readonly edgeTypes: ReadonlySet<GraphQLType>;
    readonly triggerableTypes: ReadonlySet<GraphQLType>;
    readonly idFieldMap: ReadonlyMap<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, GraphQLField<any, any>>;
    readonly typesWithParameterizedField: ReadonlySet<GraphQLObjectType | GraphQLInterfaceType>;
}
export interface Connection {
    readonly edgeType: GraphQLObjectType | GraphQLInterfaceType;
    readonly nodeType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
}
