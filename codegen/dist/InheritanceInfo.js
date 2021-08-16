"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InheritanceInfo = void 0;
const graphql_1 = require("graphql");
class InheritanceInfo {
    constructor(schema) {
        this.schema = schema;
        this._downcastTypeMap = this.createDowncastTypeMap();
        this._upcastTypeMap = this.createUpcastTypeMap();
    }
    get downcastTypeMap() {
        return this._downcastTypeMap;
    }
    get upcastTypeMap() {
        return this._upcastTypeMap;
    }
    createDowncastTypeMap() {
        const downcastTypeMap = new Map();
        const typeMap = this.schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__")) {
                const type = typeMap[typeName];
                if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
                    for (const itf of type.getInterfaces()) {
                        InheritanceInfo._add(downcastTypeMap, itf, type);
                    }
                }
                if (type instanceof graphql_1.GraphQLUnionType) {
                    for (const item of type.getTypes()) {
                        InheritanceInfo._add(downcastTypeMap, type, item);
                    }
                }
            }
        }
        InheritanceInfo._removeSuperfluous(downcastTypeMap);
        return downcastTypeMap;
    }
    createUpcastTypeMap() {
        const upcastTypeMap = new Map();
        for (const [type, derivedTypes] of this._downcastTypeMap) {
            for (const derivedType of derivedTypes) {
                let upcastTypes = upcastTypeMap.get(derivedType);
                if (upcastTypes === undefined) {
                    upcastTypeMap.set(derivedType, upcastTypes = new Set());
                }
                upcastTypes.add(type);
            }
        }
        return upcastTypeMap;
    }
    static _add(downcastTypeMap, type, downcastType) {
        let set = downcastTypeMap.get(type);
        if (set === undefined) {
            set = new Set();
            downcastTypeMap.set(type, set);
        }
        set.add(downcastType);
    }
    static _removeSuperfluous(downcastTypeMap) {
        for (const [, set] of downcastTypeMap) {
            InheritanceInfo._removeSuperfluous0(set, set, downcastTypeMap);
        }
    }
    static _removeSuperfluous0(targetImplementationTypes, currentImplementationTypes, downcastTypeMap) {
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
exports.InheritanceInfo = InheritanceInfo;
