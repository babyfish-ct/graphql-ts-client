import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
declare type EntityType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
export declare class InheritanceInfo {
    private schema;
    private _downcastTypeMap;
    private _upcastTypeMap;
    constructor(schema: GraphQLSchema);
    get downcastTypeMap(): ReadonlyMap<EntityType, Set<EntityType>>;
    get upcastTypeMap(): ReadonlyMap<EntityType, Set<EntityType>>;
    private createDowncastTypeMap;
    private createUpcastTypeMap;
    private static _add;
    private static _removeSuperfluous;
    private static _removeSuperfluous0;
}
export {};
