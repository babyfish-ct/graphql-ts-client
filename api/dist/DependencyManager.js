"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyManager = void 0;
class DependencyManager {
    constructor() {
        /*
         * Level-1-key: TypeName
         * Level-2-key: FieldName
         * Value: resurces
         */
        this.directMap = new Map();
        this.indirectMap = new Map();
    }
    register(resource, fetchers) {
        for (const fetcher of fetchers) {
            this.register0(resource, fetcher, true);
        }
    }
    unregister(resource) {
        this.unregister0(resource, true);
        this.unregister0(resource, false);
    }
    resourcesDependOnTypes(fetcher, mode = "ALL") {
        const resources = new Set();
        if (mode !== 'INDIRECT') {
            this.resourcesDependOnTypes0(fetcher, true, resources);
        }
        if (mode !== 'DIRECT') {
            this.resourcesDependOnTypes0(fetcher, false, resources);
        }
        return Array.from(resources);
    }
    resourcesDependOnFields(fetcher, mode = "ALL") {
        const resources = new Set();
        if (mode !== 'INDIRECT') {
            this.resourcesDependOnFields0(fetcher, true, resources);
        }
        if (mode !== 'DIRECT') {
            this.resourcesDependOnFields0(fetcher, false, resources);
        }
        return Array.from(resources);
    }
    register0(resource, fetcher, direct) {
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
    register1(resource, typeName, fieldName, direct) {
        const map = direct ? this.directMap : this.indirectMap;
        let subMap = map.get(typeName);
        if (subMap === undefined) {
            map.set(typeName, subMap = new Map());
        }
        let resources = subMap.get(fieldName);
        if (resources === undefined) {
            subMap.set(fieldName, resources = new Set());
        }
        resources.add(resource);
    }
    unregister0(resource, direct) {
        const map = direct ? this.directMap : this.indirectMap;
        const deletedTypeNames = new Set();
        for (const [typeName, subMap] of map) {
            const deletedFieldNames = new Set();
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
    resourcesDependOnTypes0(fetcher, direct, output) {
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
    resourcesDependOnFields0(fetcher, direct, output) {
        var _a;
        const map = direct ? this.directMap : this.indirectMap;
        for (const [fieldName, field] of fetcher.fieldMap) {
            const declaringTypeNames = getDeclaringTypeNames(fieldName, fetcher);
            for (const declaringTypeName of declaringTypeNames) {
                const resources = (_a = map.get(declaringTypeName)) === null || _a === void 0 ? void 0 : _a.get(fieldName);
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
exports.DependencyManager = DependencyManager;
function removeAll(map, keys) {
    for (const key of keys) {
        map.delete(key);
    }
    return map.size;
}
function addAll(target, source) {
    if (source !== undefined) {
        for (const element of source) {
            target.add(element);
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
function getAllSuperTypes(fetcher) {
    const allSuperTypes = new Set();
    collectAllSuperTypes(fetcher.fetchableType, allSuperTypes);
    return allSuperTypes;
}
function collectAllSuperTypes(fetchableType, output) {
    output.add(fetchableType.entityName);
    for (const superType of fetchableType.superTypes) {
        collectAllSuperTypes(superType, output);
    }
}
