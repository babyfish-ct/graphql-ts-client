export interface FetchableType<E extends string> {
    readonly name: E;
    readonly category: FetchableTypeCategory;
    readonly superTypes: readonly FetchableType<string>[];
    readonly declaredFields: ReadonlyMap<string, FetchableField>;
    readonly fields: ReadonlyMap<string, FetchableField>;
}

export interface FetchableField {
    readonly name: string;
    readonly category: FetchableFieldCategory;
    readonly argGraphQLTypeMap: ReadonlyMap<string, string>;
    readonly targetTypeName?: string;
    readonly connectionTypeName?: string;
    readonly edgeTypeName?: string;
    readonly isPlural: boolean;
    readonly isAssociation: boolean;
    readonly isFunction: boolean;
    readonly isUndefinable: boolean;
}

export type FetchableTypeCategory = "OBJECT" | "CONNECTION" | "EDGE";

export type FetchableFieldCategory = "ID" | "SCALAR" | "REFERENCE" | "LIST" | "CONNECTION";

export function createFetchableType<E extends string>(
    name: E,
    category: FetchableTypeCategory,
    superTypes: readonly FetchableType<string>[],
    declaredFields: ReadonlyArray<string | { 
        readonly name: string,
        readonly category: FetchableFieldCategory,
        readonly undefinable?: boolean,
        readonly argGraphQLTypeMap?: { readonly [key: string]: string },
        readonly targetTypeName?: string,
        readonly connectionTypeName?: string,
        readonly edgeTypeName?: string
    }>
): FetchableType<E> {
    const declaredFieldMap = new Map<string, FetchableField>();
    for (const declaredField of declaredFields) {
        if (typeof declaredField === 'string') {
            declaredFieldMap.set(declaredField, new FetchableFieldImpl(
                declaredField,
                "SCALAR",
                new Map<string, string>()
            ));
        } else {
            const argGraphQLTypeMap = new Map<string, string>();
            if (declaredField.argGraphQLTypeMap !== undefined) {
                for (const argName in  declaredField.argGraphQLTypeMap) {
                    const argGraphQLType = declaredField.argGraphQLTypeMap[argName];
                    argGraphQLTypeMap.set(argName, argGraphQLType);
                }
            }
            declaredFieldMap.set(declaredField.name, new FetchableFieldImpl(
                declaredField.name,
                declaredField.category,
                argGraphQLTypeMap,
                declaredField.targetTypeName,
                declaredField.connectionTypeName,
                declaredField.edgeTypeName,
                declaredField.undefinable
            ));
        }
    }
    return new FetchableTypeImpl<E>(name, category, superTypes, declaredFieldMap);
}

class FetchableTypeImpl<E extends string> implements FetchableType<E> {

    private _fields?: ReadonlyMap<string, FetchableField>;

    constructor(
        readonly name: E,
        readonly category: FetchableTypeCategory,
        readonly superTypes: readonly FetchableType<string>[],
        readonly declaredFields: ReadonlyMap<string, FetchableField>
    ) {
        if (category === "CONNECTION") {
            const edges = declaredFields.get("edges");
            if (edges === undefined) {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because it's not field named "edges"`
                );
            }
            if (edges.category !== "LIST") {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because its field "edges" is not list`
                );
            }
        } else if (category === "EDGE") {
            const node = declaredFields.get("node");
            if (node === undefined) {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "EDGE" because it's not field named "node"`
                );
            }
            if (node.category !== "REFERENCE") {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because its field "node" is not referece`
                );
            }
            const cursor = declaredFields.get("cursor");
            if (cursor === undefined) {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "EDGE" because it's not field named "cursor"`
                );
            }
            if (cursor.category !== "SCALAR") {
                throw new Error(
                    `Illegal fetchable type "${name}", ` +
                    `its category cannot be "CONNECTION" because its field "cursor" is not referece`
                );
            }
        }
        if (category !== "OBJECT" && superTypes.length !== 0) {
            throw new Error(
                `Illegal fetchable type "${name}", ` +
                `super class can only be specified for object type but its category is "${category}"`
            );
        }
    }

    get fields(): ReadonlyMap<string, FetchableField> {
        let fds = this._fields;
        if (fds === undefined) {
            if (this.superTypes.length === 0) {
                fds = this.declaredFields;
            } else {
                const map = new Map<string, FetchableField>();
                collectFields(this, map);
                fds = map;
            }
            this._fields = fds;
        }
        return fds;
    }
}

class FetchableFieldImpl implements FetchableField {

    private _undefinable: boolean;
    
    constructor(
        readonly name: string,
        readonly category: FetchableFieldCategory,
        readonly argGraphQLTypeMap: ReadonlyMap<string, string>,
        readonly targetTypeName?: string,
        readonly connectionTypeName?: string,
        readonly edgeTypeName?: string,
        undefinable?: boolean
    ) {
        this._undefinable = undefinable ?? false;
    }

    get isPlural(): boolean {
        return this.category === "LIST" || this.category === "CONNECTION";
    }

    get isAssociation(): boolean {
        return this.category === "REFERENCE" || this.isPlural;
    }

    get isFunction(): boolean {
        return this.argGraphQLTypeMap.size !== 0 || this.isAssociation;
    }

    get isUndefinable(): boolean {
        return this._undefinable;
    }
}

function collectFields(fetchableType: FetchableType<string>, output: Map<string, FetchableField>) {
    for (const [name, field] of fetchableType.declaredFields) {
        output.set(name, field);
    }
    for (const superType of fetchableType.superTypes) {
        collectFields(superType, output);
    }
}