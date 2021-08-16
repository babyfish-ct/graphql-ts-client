import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";

type EntityType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;

export class InheritanceInfo {

    private _downcastTypeMap: Map<EntityType, Set<EntityType>>;

    private _upcastTypeMap: Map<EntityType, Set<EntityType>>;
    
    constructor(private schema: GraphQLSchema) {
        this._downcastTypeMap = this.createDowncastTypeMap();
        this._upcastTypeMap = this.createUpcastTypeMap();    
    }

    get downcastTypeMap(): ReadonlyMap<EntityType, Set<EntityType>> {
        return this._downcastTypeMap;
    }

    get upcastTypeMap(): ReadonlyMap<EntityType, Set<EntityType>> {
        return this._upcastTypeMap;
    }

    private createDowncastTypeMap(): Map<EntityType, Set<EntityType>> {
        const downcastTypeMap = new Map<EntityType, Set<EntityType>>();
        const typeMap = this.schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__")) {
                const type = typeMap[typeName];
                if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
                    for (const itf of type.getInterfaces()) {
                        InheritanceInfo._add(downcastTypeMap, itf, type);
                    }
                }
                if (type instanceof GraphQLUnionType) {
                    for (const item of type.getTypes()) {
                        InheritanceInfo._add(downcastTypeMap, type, item);
                    }
                }
            }
        }
        InheritanceInfo._removeSuperfluous(downcastTypeMap);
        return downcastTypeMap;
    }

    private createUpcastTypeMap(): Map<EntityType, Set<EntityType>> {
        const upcastTypeMap = new Map<EntityType, Set<EntityType>>();
        for (const [type, derivedTypes] of this._downcastTypeMap) {
            for (const derivedType of derivedTypes) {
                let upcastTypes = upcastTypeMap.get(derivedType);
                if (upcastTypes === undefined) {
                    upcastTypeMap.set(derivedType, upcastTypes = new Set<EntityType>());
                }
                upcastTypes.add(type);
            }
        }
        return upcastTypeMap;
    }

    private static _add(
        downcastTypeMap: Map<EntityType, Set<EntityType>>, 
        type: EntityType, 
        downcastType: EntityType
    ) {
        let set = downcastTypeMap.get(type);
        if (set === undefined) {
            set = new Set<EntityType>();
            downcastTypeMap.set(type, set);
        }
        set.add(downcastType);
    }

    private static _removeSuperfluous(
        downcastTypeMap: ReadonlyMap<EntityType, Set<EntityType>>,
    ) {
        for (const [, set] of downcastTypeMap) {
            InheritanceInfo._removeSuperfluous0(set, set, downcastTypeMap);
        }
    }

    private static _removeSuperfluous0(
        targetImplementationTypes: Set<EntityType>,
        currentImplementationTypes: ReadonlySet<EntityType>,
        downcastTypeMap: ReadonlyMap<EntityType, Set<EntityType>>,
    ) {
        for (const currentType of currentImplementationTypes) {
            if (targetImplementationTypes !== currentImplementationTypes) {
                targetImplementationTypes.delete(currentType);        
            }
            const deeperSet = downcastTypeMap.get(currentType);
            if (deeperSet !== undefined) {
                InheritanceInfo._removeSuperfluous0(targetImplementationTypes, deeperSet, downcastTypeMap);
            }
        }
    }
}