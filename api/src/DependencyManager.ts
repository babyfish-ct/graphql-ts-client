/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { FetchableType, Fetcher } from "./Fetcher";

export class DependencyManager {

    /*
     * key: Name the root entity type of query
     */ 
    private rootTypeResourceMap = new Map<string, Resources>();

    /*
     * level-1 key: FieldName
     * level-2 key: Field name
     */
    private fieldResourceMap = new Map<string, Map<string, Resources>>();

    private _idGetter: (obj: any) => any;

    constructor(idGetter?: (obj: any) => any) {
        (window as any).dependencyManager = this;
        this._idGetter = idGetter ?? getDefaultId;
    }

    register(resource: string, fetcher: Fetcher<string, object, object>, fieldDependencies?: readonly Fetcher<string, object, object>[]) {
        if (fieldDependencies !== undefined) {
            this.registerTypes(resource, [fetcher, ...fieldDependencies]);
            this.registerFields(resource, fieldDependencies);
        } else {
            this.registerTypes(resource, [fetcher]);
        }
    }

    unregister(resource: string) {
        removeResource(this.rootTypeResourceMap, resource);
        removeResource(this.fieldResourceMap, resource);
    }

    resources<TObject extends object>(
        fetcher: Fetcher<string, TObject, object>, 
        oldObject: TObject | null | undefined, 
        newObject: TObject | null | undefined
    ): string[] {
        const resources = new Set<string>();
        this.collectResources(
            fetcher, 
            nullToUndefined(oldObject), 
            nullToUndefined(newObject), 
            resources
        );
        return Array.from(resources);
    }

    allResources(fetcher: Fetcher<string, object, object>) {
        const resources = new Set<string>();
        this.collectAllResources(fetcher, resources);
        return Array.from(resources);
    }

    private registerTypes(resource: string, fetchers: readonly Fetcher<string, object, object>[]) {
        for (const fetcher of fetchers) {
            const isOperation = isOperationFetcher(fetcher);
            for (const [fieldName, field] of fetcher.fieldMap) {
                if (isOperation || fieldName.startsWith("...")) { //only register recursivly for fragment
                    if (field.childFetchers !== undefined) {
                        this.registerTypes(resource, field.childFetchers);
                    }
                } else {
                    const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
                    for (const declaringTypeName of declaringTypeNames) {
                        compute(this.rootTypeResourceMap, declaringTypeName, () => new Resources()).retain(resource);
                    }
                }
            }
        }
    }

    private registerFields(resource: string, fetchers: readonly Fetcher<string, object, object>[]) {
        for (const fetcher of fetchers) {
            const isOperation = isOperationFetcher(fetcher);
            for (const [fieldName, field] of fetcher.fieldMap) {
                if (!isOperation && !fieldName.startsWith("...")) {
                    const subMap = compute(this.fieldResourceMap, fieldName, () => new Map<string, Resources>());
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

    private collectResources(
        fetcher: Fetcher<string, object, object>, 
        oldObject: object | undefined, 
        newObject: object | undefined,
        output: Set<string>
    ) {
        if (oldObject === newObject) { // Include both undefined
            return;
        }
        
        if (oldObject === undefined || newObject === undefined) {
            this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)?.copyTo(output);
        } else if (!isOperationFetcher(fetcher)) {
            const oldId = this._idGetter(oldObject);
            const newId = this._idGetter(newObject);
            if (oldId !== newId) {
                this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)?.copyTo(output);
            }
        }

        for (const [fieldName, field] of fetcher.fieldMap) {
            if (fieldName.startsWith("...")) { // Fragment, not assocaition
                if (field.childFetchers !== undefined) {
                    for (const childFetcher of field.childFetchers) {
                        this.collectResources(childFetcher, oldObject, newObject, output);
                    }
                }
            } else {
                const oldValue = nullToUndefined(oldObject !== undefined ? oldObject[fieldName] : undefined);
                const newValue = nullToUndefined(newObject !== undefined ? newObject[fieldName] : undefined);
                if (field.childFetchers !== undefined && field.childFetchers.length !== 0) { // association
                    if (oldValue !== newValue) { // Not both undefined
                        for (const childFetcher of field.childFetchers) {
                            this.collectResourcesByAssocaiton(fetcher, fieldName, childFetcher, oldValue, newValue, output);
                        }
                    }
                } else if (!scalarEqual(oldValue, newValue)) { // scalar
                    const subMap = this.fieldResourceMap.get(fieldName);
                    if (subMap !== undefined) {
                        const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
                        for (const declaringTypeName of declaringTypeNames) {
                            subMap.get(declaringTypeName)?.copyTo(output);
                        }
                    }
                }
            } 
        }
    }

    private collectResourcesByAssocaiton(
        parentFetcher: Fetcher<string, object, object>,
        fieldName: string,
        childFetcher: Fetcher<string, object, object>, 
        oldAssociation: any, 
        newAssociation: any,
        output: Set<string>
    ) {
        if (oldAssociation === undefined || newAssociation === undefined || Array.isArray(oldAssociation) !== Array.isArray(newAssociation)) {
            if (Array.isArray(oldAssociation)) {
                for (const element of oldAssociation) {
                    this.collectResources(childFetcher, nullToUndefined(element), undefined, output);
                }
            } else if (typeof oldAssociation === 'object') {
                this.collectResources(childFetcher, oldAssociation, undefined, output);
            }
            if (Array.isArray(newAssociation)) {
                for (const element of newAssociation) {
                    this.collectResources(childFetcher, undefined, nullToUndefined(element), output);
                }
            } else if (typeof newAssociation === 'object') {
                this.collectResources(childFetcher, undefined, newAssociation, output);
            }
        } else if (Array.isArray(oldAssociation) && Array.isArray(newAssociation)) {
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
        } else if (typeof oldAssociation === 'object' && typeof newAssociation === 'object') {
            this.collectResources(childFetcher, oldAssociation, newAssociation, output);
        } else {
            const declaringType = getDeclaringTypeNames(fieldName, parentFetcher)[0];
            console.warn(`Illegal data, cannot compare the data ${oldAssociation} and ${newAssociation} for the assocaiton ${declaringType}.${fieldName}`);
        }
    }

    private collectAllResources(fetcher: Fetcher<string, object, object>, output: Set<string>) {
        this.rootTypeResourceMap.get(fetcher.fetchableType.entityName)?.copyTo(output);
        for (const [fieldName, field] of fetcher.fieldMap) {
            if (!fieldName.startsWith("...")) { // Not fragment
                const declaringTypes = getDeclaringTypeNames(fieldName, fetcher);
                for (const declaringType of declaringTypes) {
                    this.rootTypeResourceMap.get(declaringType)?.copyTo(output);
                    this.fieldResourceMap.get(fieldName)?.get(declaringType)?.copyTo(output);
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

class Resources {

    private refCountMap = new Map<string, number>();

    retain(resource: string) {
        this.refCountMap.set(resource, (this.refCountMap.get(resource) ?? 0) + 1);
    }

    release(resource: string): number {
        const refCount = this.refCountMap.get(resource);
        if (refCount !== undefined) {
            if (refCount > 1) {
                this.refCountMap.set(resource, refCount - 1);
            } else {
                this.refCountMap.delete(resource);
            }
        }
        return this.refCountMap.size;
    }

    copyTo(output: Set<string>) {
        for (const [resource] of this.refCountMap) {
            output.add(resource);
        }
    }
}

function isOperationFetcher(fetcher: Fetcher<string, object, object>): boolean {
    const fetcherName = fetcher.fetchableType.entityName;
    return fetcherName === "Query" || fetcherName === 'Mutation';
}

function getDeclaringTypeNames(fieldName: string, fetcher: Fetcher<string, object, object>): Set<string> {
    const declaringTypeNames = new Set<string>();
    if (fieldName !== '' && fieldName !== '...') {
        collectDeclaringTypeNames(fieldName, fetcher.fetchableType, declaringTypeNames);
    }
    return declaringTypeNames;
}

function collectDeclaringTypeNames(fieldName: string, fetchableType: FetchableType<string>, output: Set<string>) {
    if (fetchableType.declaredFields.has(fieldName)) {
        output.add(fetchableType.entityName);
    } else {
        for (const superType of fetchableType.superTypes) {
            collectDeclaringTypeNames(fieldName, superType, output);
        }
    }
}

function getDefaultId(value: any): any {
    const id = value.id ?? value._id;
    if (id === undefined) {
        throw Error(`There is no id/_id in the object ${JSON.stringify(value)}`);
    }
    return id;
}

function compute<K, V>(map: Map<K, V>, key: K, valueSupplier: (key: K) => V): V {
    let value = map.get(key);
    if (value === undefined) {
        map.set(key, value = valueSupplier(key));
    }
    return value;
}

type RecursiveResourceMap = Map<string, Resources | RecursiveResourceMap>;
function removeResource(recursiveResourceMap: RecursiveResourceMap, resource: string) {
    const deletedKeys = new Set<string>();
    for (const [key, deeperValue] of recursiveResourceMap) {
        if (deeperValue instanceof Resources) {
            if (deeperValue.release(resource) === 0) {
                deletedKeys.add(key);
            }
        } else {
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

function associatedBy<K, V>(values: V[], keyGetter: (value: V) => K): Map<K, V> {
    const map = new Map<K, V>();
    for (const value of values) {
        if (value !== undefined && value !== null) {
            const key = keyGetter(value);
            map.set(key, value);
        }
    }
    return map;
}

function scalarEqual(left: any, right: any) {
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

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
    return value === null ? undefined : value;
}
