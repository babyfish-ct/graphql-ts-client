import { FetchableType, Fetcher } from "./Fetcher";

export class DependencyManager {

    /*
     * Level-1-key: TypeName
     * Level-2-key: FieldName
     * Value: resurces
     */

    private directMap = new Map<string, Map<string, Set<string>>>();

    private indirectMap = new Map<string, Map<string, Set<string>>>();

    register(resource: string, fetchers: Fetcher<string, object>[]) {
        for (const fetcher of fetchers) {
            this.register0(resource, fetcher, true);
        }
    }

    unregister(resource: string) {
        this.unregister0(resource, true);
        this.unregister0(resource, false);
    }

    resourcesDependOnTypes(fetcher: Fetcher<string, object>, mode: DependencyMode = "ALL"): string[] {
        const resources = new Set<string>();
        if (mode !== 'INDIRECT') {
            this.resourcesDependOnTypes0(fetcher, true, resources);
        }
        if (mode !== 'DIRECT') {
            this.resourcesDependOnTypes0(fetcher, false, resources);
        }
        return Array.from(resources);
    }

    resourcesDependOnFields(fetcher: Fetcher<string, object>, mode: DependencyMode = "ALL"): string[] {
        const resources = new Set<string>();
        if (mode !== 'INDIRECT') {
            this.resourcesDependOnFields0(fetcher, true, resources);
        }
        if (mode !== 'DIRECT') {
            this.resourcesDependOnFields0(fetcher, false, resources);
        }
        return Array.from(resources);
    }

    private register0(resource: string, fetcher: Fetcher<string, object>, direct: boolean) {
        for (const [fieldName, field] of fetcher.fieldMap) {
            const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
            for (const declaringTypeName of declaringTypeNames) {
                this.register1(resource, declaringTypeName, fieldName, direct);
            }
            if (field.childFetchers !== undefined) {
                for (const childFetcher of field.childFetchers) {
                    this.register0(resource, childFetcher, direct && fieldName.startsWith("..."));
                }
            }
        }
    }

    private register1(resource: string, typeName: string, fieldName: string, direct: boolean) {
        const map = direct ? this.directMap : this.indirectMap;
        let subMap = map.get(typeName);
        if (subMap === undefined) {
            map.set(typeName, subMap = new Map<string, Set<string>>());
        }
        let resources = subMap.get(fieldName);
        if (resources === undefined) {
            subMap.set(fieldName, resources = new Set<string>());
        }
        resources.add(resource);
    }

    private unregister0(resource: string, direct: boolean) {
        const map = direct ? this.directMap : this.indirectMap;
        const deletedTypeNames = new Set<string>();
        for (const [typeName, subMap] of map) {
            const deletedFieldNames = new Set<string>();
            for (const [fieldName, resources] of subMap) {
                if (resources.delete(resource) && resources.size === 0) {
                    deletedFieldNames.add(fieldName);
                }
            }
            if (removeAll(subMap, deletedFieldNames) === 0) {
                deletedTypeNames.add(typeName);
            }
        }
        removeAll(map, deletedTypeNames);
    }

    private resourcesDependOnTypes0(fetcher: Fetcher<string, object>, direct: boolean, output: Set<string>) {
        const map = direct ? this.directMap : this.indirectMap;
        const typeNames = getAllSuperTypes(fetcher);
        for (const typeName of typeNames) {
            const subMap = map.get(typeName);
            if (subMap !== undefined) {
                for (const [, resources] of subMap) {
                    addAll(output, resources);
                }
            }
        }
        if (direct === false) {
            for (const [, field] of fetcher.fieldMap) {
                if (field.childFetchers !== undefined) {
                    for (const childFetcher of field.childFetchers) {
                        this.resourcesDependOnTypes0(childFetcher, false, output);
                    }
                }
            }
        }
    }

    private resourcesDependOnFields0(fetcher: Fetcher<string, object>, direct: boolean, output: Set<string>) {
        const map = direct ? this.directMap : this.indirectMap;
        for (const [fieldName, field] of fetcher.fieldMap) {
            const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
            for (const declaringTypeName of declaringTypeNames) {
                const resources = map.get(declaringTypeName)?.get(fieldName);
                addAll(output, resources);
                if (direct === false && field.childFetchers !== undefined) {
                    for (const childFetcher of field.childFetchers) {
                        this.resourcesDependOnFields0(childFetcher, false, output);
                    }
                }
            }
        }
    }
}

export type DependencyMode = "DIRECT" | "INDIRECT" | "ALL";

function removeAll<K>(map: Map<K, any>, keys: ReadonlySet<K>): number {
    for (const key of keys) {
        map.delete(key);
    }
    return map.size;
}

function addAll<E>(target: Set<E>, source?: ReadonlySet<E>) {
    if (source !== undefined) {
        for (const element of source) {
            target.add(element);
        }
    }
}

function getDeclaringTypeNames(fieldName: string, fetcher: Fetcher<string, object>): Set<string> {
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
            this.collectDeclaringTypeNames(fieldName, superType, output);
        }
    }
}

function getAllSuperTypes(fetcher: Fetcher<string, object>): Set<string> {
    const allSuperTypes = new Set<string>();
    collectAllSuperTypes(fetcher.fetchableType, allSuperTypes);
    return allSuperTypes;
}

function collectAllSuperTypes(fetchableType: FetchableType<string>, output: Set<string>) {
    output.add(fetchableType.entityName);
    for (const superType of fetchableType.superTypes) {
        collectAllSuperTypes(superType, output);
    }
}