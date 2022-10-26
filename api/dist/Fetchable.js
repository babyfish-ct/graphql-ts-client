"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetchableType = void 0;
function createFetchableType(name, category, superTypes, declaredFields) {
    const declaredFieldMap = new Map();
    for (const declaredField of declaredFields) {
        if (typeof declaredField === 'string') {
            declaredFieldMap.set(declaredField, new FetchableFieldImpl(declaredField, "SCALAR", new Map()));
        }
        else {
            const argGraphQLTypeMap = new Map();
            if (declaredField.argGraphQLTypeMap !== undefined) {
                for (const argName in declaredField.argGraphQLTypeMap) {
                    const argGraphQLType = declaredField.argGraphQLTypeMap[argName];
                    argGraphQLTypeMap.set(argName, argGraphQLType);
                }
            }
            declaredFieldMap.set(declaredField.name, new FetchableFieldImpl(declaredField.name, declaredField.category, argGraphQLTypeMap, declaredField.targetTypeName, declaredField.connectionTypeName, declaredField.edgeTypeName, declaredField.undefinable));
        }
    }
    return new FetchableTypeImpl(name, category, superTypes, declaredFieldMap);
}
exports.createFetchableType = createFetchableType;
class FetchableTypeImpl {
    constructor(name, category, superTypes, declaredFields) {
        this.name = name;
        this.category = category;
        this.superTypes = superTypes;
        this.declaredFields = declaredFields;
        if (category === "CONNECTION") {
            const edges = declaredFields.get("edges");
            if (edges === undefined) {
                throw new Error(`Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because it's not field named "edges"`);
            }
            if (edges.category !== "LIST") {
                throw new Error(`Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because its field "edges" is not list`);
            }
        }
        else if (category === "EDGE") {
            const node = declaredFields.get("node");
            if (node === undefined) {
                throw new Error(`Illegal fetchable type "${name}", ` +
                    `its category cannot be "EDGE" because it's not field named "node"`);
            }
            if (node.category !== "REFERENCE") {
                throw new Error(`Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because its field "node" is not referece`);
            }
            const cursor = declaredFields.get("cursor");
            if (cursor !== undefined && cursor.category !== "SCALAR") {
                throw new Error(`Illegal fetchable type "${name}", ` +
                    `its category cannot be "EDGE" because its field "cursor" is not referece`);
            }
        }
        if ((category === "CONNECTION" || category === "EDGE") && superTypes.length !== 0) {
            throw new Error(`Illegal fetchable type "${name}", ` +
                `super class can only be specified for object/embeddable type but its category is "${category}"`);
        }
    }
    get fields() {
        let fds = this._fields;
        if (fds === undefined) {
            if (this.superTypes.length === 0) {
                fds = this.declaredFields;
            }
            else {
                const map = new Map();
                collectFields(this, map);
                fds = map;
            }
            this._fields = fds;
        }
        return fds;
    }
}
class FetchableFieldImpl {
    constructor(name, category, argGraphQLTypeMap, targetTypeName, connectionTypeName, edgeTypeName, undefinable) {
        this.name = name;
        this.category = category;
        this.argGraphQLTypeMap = argGraphQLTypeMap;
        this.targetTypeName = targetTypeName;
        this.connectionTypeName = connectionTypeName;
        this.edgeTypeName = edgeTypeName;
        this._undefinable = undefinable !== null && undefinable !== void 0 ? undefinable : false;
    }
    get isPlural() {
        return this.category === "LIST" || this.category === "CONNECTION";
    }
    get isAssociation() {
        return this.category === "REFERENCE" || this.isPlural;
    }
    get isFunction() {
        return this.argGraphQLTypeMap.size !== 0 || this.isAssociation || this.targetTypeName !== undefined;
    }
    get isUndefinable() {
        return this._undefinable;
    }
}
function collectFields(fetchableType, output) {
    for (const [name, field] of fetchableType.declaredFields) {
        output.set(name, field);
    }
    for (const superType of fetchableType.superTypes) {
        collectFields(superType, output);
    }
}
