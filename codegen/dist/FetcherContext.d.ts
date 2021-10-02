import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
export interface FetcherContext {
    readonly schema: GraphQLSchema;
    readonly fetcherTypes: ReadonlyArray<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType>;
    readonly connectionTypes: Set<GraphQLObjectType>;
    readonly edgeTypes: Set<GraphQLObjectType>;
}
