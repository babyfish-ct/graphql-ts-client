"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyManager = void 0;
class DependencyManager {
    constructor(idGetter) {
        /*
         * key: Name the root entity type of query
         */
        this.rootTypeResourceMap = new Map();
        /*
         * level-1 key: FieldName
         * level-2 key: Field name
         */
        this.fieldResourceMap = new Map();
        window.dependencyManager = this;
        this._idGetter = idGetter !== null && idGetter !== void 0 ? idGetter : getDefaultId;
    }
    register(resource, fetcher, fieldDependencies) {
        if (fieldDependencies !== undefined) {
            this.registerTypes(resource, [fetcher, ...fieldDependencies]);
            this.registerFields(resource, fieldDependencies);
        }
        else {
            this.registerTypes(resource, [fetcher]);
        }
    }
    unregister(resource) {
        removeResource(this.rootTypeResourceMap, resource);
        removeResource(this.fieldResourceMap, resource);
    }
    resources(fetcher, oldObject, newObject) {
        const resources = new Set();
        this.collectResources(fetcher, nullToUndefined(oldObject), nullToUndefined(newObject), resources);
        return Array.from(resources);
    }
    allResources(fetcher) {
        const resources = new Set();
        this.collectAllResources(fetcher, resources);
        return Array.from(resources);
    }
    registerTypes(resource, fetchers) {
        for (const fetcher of fetchers) {
            for (const [fieldName, field] of fetcher.fieldMap) {
                const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
                for (const declaringTypeName of declaringTypeNames) {
                    compute(this.rootTypeResourceMap, declaringTypeName, () => new Resources()).retain(resource);
                }
                if (fieldName.startsWith("...")) { //only register recursivly for fragment
                    if (field.childFetchers !== undefined) {
                        this.registerTypes(resource, field.childFetchers);
                    }
                }
            }
        }
    }
    registerFields(resource, fetchers) {
        for (const fetcher of fetchers) {
            for (const [fieldName, field] of fetcher.fieldMap) {
                if (!fieldName.startsWith("...")) {
                    const subMap = compute(this.fieldResourceMap, fieldName, () => new Map());
                    const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
                    for (const declaringTypeName of declaringTypeNames) {
                        compute(subMap, declaringTypeName, () => new Resources()).retain(resource);
                    }
                }
                if (field.childFetchers !== undefined) {
                    this.registerFields(resource, field.childFetchers);
                }
            }
        }
    }
    collectResources(fetcher, oldObject, newObject, output) {
        var _a, _b, _c;
        if (oldObject === newObject) { // Include both undefined
            return;
        }
        let objDiff = false;
        if (oldObject === undefined || newObject === undefined) {
            (_a = this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)) === null || _a === void 0 ? void 0 : _a.copyTo(output);
            objDiff = true;
        }
        else {
            const oldId = this._idGetter(oldObject);
            const newId = this._idGetter(newObject);
            if (oldId !== newId) {
                (_b = this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)) === null || _b === void 0 ? void 0 : _b.copyTo(output);
                objDiff = true;
            }
        }
        for (const [fieldName, field] of fetcher.fieldMap) {
            if (fieldName.startsWith("...")) { // Fragment, not assocaition
                if (field.childFetchers !== undefined) {
                    for (const childFetcher of field.childFetchers) {
                        this.collectResources(childFetcher, oldObject, newObject, output);
                    }
                }
            }
            else {
                const oldValue = nullToUndefined(oldObject !== undefined ? oldObject[fieldName] : undefined);
                const newValue = nullToUndefined(newObject !== undefined ? newObject[fieldName] : undefined);
                if (field.childFetchers !== undefined && field.childFetchers.length !== 0) { // association
                    if (oldValue !== newValue) { // Not both undefined
                        for (const childFetcher of field.childFetchers) {
                            this.collectResourcesByAssocaiton(fetcher, fieldName, childFetcher, oldValue, newValue, output);
                        }
                    }
                }
                else if (!scalarEqual(oldValue, newValue)) { // scalar
                    const subMap = this.fieldResourceMap.get(fieldName);
                    if (subMap !== undefined) {
                        const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
                        for (const declaringTypeName of declaringTypeNames) {
                            (_c = subMap.get(declaringTypeName)) === null || _c === void 0 ? void 0 : _c.copyTo(output);
                        }
                    }
                }
            }
        }
    }
    collectResourcesByAssocaiton(parentFetcher, fieldName, childFetcher, oldAssociation, newAssociation, output) {
        if (oldAssociation === undefined || newAssociation === undefined || Array.isArray(oldAssociation) !== Array.isArray(newAssociation)) {
            if (Array.isArray(oldAssociation)) {
                for (const element of oldAssociation) {
                    this.collectResources(childFetcher, nullToUndefined(element), undefined, output);
                }
            }
            else if (typeof oldAssociation === 'object') {
                this.collectResources(childFetcher, oldAssociation, undefined, output);
            }
            if (Array.isArray(newAssociation)) {
                for (const element of newAssociation) {
                    this.collectResources(childFetcher, undefined, nullToUndefined(element), output);
                }
            }
            else if (typeof newAssociation === 'object') {
                this.collectResources(childFetcher, undefined, newAssociation, output);
            }
        }
        else if (Array.isArray(oldAssociation) && Array.isArray(newAssociation)) {
            const map1 = associatedBy(oldAssociation, this._idGetter);
            const map2 = associatedBy(newAssociation, this._idGetter);
            for (const [k, o1] of map1) {
                const o2 = map2.get(k);
                this.collectResources(childFetcher, nullToUndefined(o1), nullToUndefined(o2), output);
            }
            for (const [k, o2] of map2) {
                if (!map2.has(k)) {
                    this.collectResources(childFetcher, undefined, nullToUndefined(o2), output);
                }
            }
        }
        else if (typeof oldAssociation === 'object' && typeof newAssociation === 'object') {
            this.collectResources(childFetcher, oldAssociation, newAssociation, output);
        }
        else {
            const declaringType = getDeclaringTypeNames(fieldName, parentFetcher)[0];
            console.warn(`Illegal data, cannot compare the data ${oldAssociation} and ${newAssociation} for the assocaiton ${declaringType}.${fieldName}`);
        }
    }
    collectAllResources(fetcher, output) {
        var _a, _b, _c, _d;
        (_a = this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)) === null || _a === void 0 ? void 0 : _a.copyTo(output);
        for (const [fieldName, field] of fetcher.fieldMap) {
            if (!fieldName.startsWith("...")) { // Not fragment
                const declaringTypes = getDeclaringTypeNames(fieldName, fetcher);
                for (const declaringType of declaringTypes) {
                    (_b = this.rootTypeResourceMap.get(declaringType)) === null || _b === void 0 ? void 0 : _b.copyTo(output);
                    (_d = (_c = this.fieldResourceMap.get(fieldName)) === null || _c === void 0 ? void 0 : _c.get(declaringType)) === null || _d === void 0 ? void 0 : _d.copyTo(output);
                }
            }
            if (field.childFetchers !== undefined) {
                for (const childFetcher of field.childFetchers) {
                    this.collectAllResources(childFetcher, output);
                }
            }
        }
    }
}
exports.DependencyManager = DependencyManager;
class Resources {
    constructor() {
        this.refCountMap = new Map();
    }
    retain(resource) {
        var _a;
        this.refCountMap.set(resource, ((_a = this.refCountMap.get(resource)) !== null && _a !== void 0 ? _a : 0) + 1);
    }
    release(resource) {
        const refCount = this.refCountMap.get(resource);
        if (refCount !== undefined) {
            if (refCount > 1) {
                this.refCountMap.set(resource, refCount - 1);
            }
            else {
                this.refCountMap.delete(resource);
            }
        }
        return this.refCountMap.size;
    }
    copyTo(output) {
        for (const [resource] of this.refCountMap) {
            output.add(resource);
        }
    }
}
function getDeclaringTypeNames(fieldName, fetcher) {
    const declaringTypeNames = new Set();
    if (fieldName !== '' && fieldName !== '...') {
        collectDeclaringTypeNames(fieldName, fetcher.fetchableType, declaringTypeNames);
    }
    return declaringTypeNames;
}
function collectDeclaringTypeNames(fieldName, fetchableType, output) {
    if (fetchableType.declaredFields.has(fieldName)) {
        output.add(fetchableType.entityName);
    }
    else {
        for (const superType of fetchableType.superTypes) {
            this.collectDeclaringTypeNames(fieldName, superType, output);
        }
    }
}
function getDefaultId(value) {
    var _a;
    const id = (_a = value.id) !== null && _a !== void 0 ? _a : value._id;
    if (id === undefined) {
        throw Error(`There is no id/_id in the object ${JSON.stringify(value)}`);
    }
    return id;
}
function compute(map, key, valueSupplier) {
    let value = map.get(key);
    if (value === undefined) {
        map.set(key, value = valueSupplier(key));
    }
    return value;
}
function removeResource(recursiveResourceMap, resource) {
    const deletedKeys = new Set();
    for (const [key, deeperValue] of recursiveResourceMap) {
        if (deeperValue instanceof Resources) {
            if (deeperValue.release(resource) === 0) {
                deletedKeys.add(key);
            }
        }
        else {
            removeResource(deeperValue, resource);
            if (deeperValue.size === 0) {
                deletedKeys.add(key);
            }
        }
    }
    for (const deletedKey of deletedKeys) {
        recursiveResourceMap.delete(deletedKey);
    }
}
function associatedBy(values, keyGetter) {
    const map = new Map();
    for (const value of values) {
        const key = keyGetter(value);
        map.set(key, value);
    }
    return map;
}
function scalarEqual(left, right) {
    if (Array.isArray(left) && Array.isArray(right)) {
        if (left.length !== right.length) {
            return false;
        }
        for (let i = left.length - 1; i >= 0; --i) {
            if (nullToUndefined(left[i]) !== nullToUndefined(right[i])) {
                return false;
            }
        }
        return true;
    }
    return left === right;
}
function nullToUndefined(value) {
    return value === null ? undefined : value;
}
