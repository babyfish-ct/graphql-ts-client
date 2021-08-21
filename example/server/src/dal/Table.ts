/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

export class Table<R extends object> {

    private name: string;

    private idProp: keyof R;

    private uniqueIndexMap = new Map<
        keyof R, // Column, this demo only support single column index
        Map<any, R> // Map<Value, Row>
    >();

    private indexMap = new Map<
        keyof R, // Column, this demo only support single column index
        Map<any, Map<any, R>> // Map<Value, Map<Id, Row>>
    >();

    private foreignKeyMap: ReadonlyMap<keyof R, Table<any>>;

    private foreignKeyReversedReferences: ForeignKeyReversedReference[] = [];

    constructor(
        args: TableArgs<R>
    ) {
        this.name = args.name;
        this.idProp = args.idProp;

        for (const uniqueIndex of args.uniqueIndexs ?? []) {
            this.uniqueIndexMap.set(uniqueIndex, new Map<any, R>());
        }
        if (!this.uniqueIndexMap.has(args.idProp)) {
            this.uniqueIndexMap.set(args.idProp, new Map<any, R>());
        }

        for (const index of args.indexes ?? []) {
            if (this.uniqueIndexMap.has(index)) {
                throw new Error(`${index} canot be both unique index and generic index`);
            }
            this.indexMap.set(index, new Map<any, Map<any, R>>());
        }

        this.foreignKeyMap = args.foreignKeys?.toMap(this) ?? new Map();
        for (const entry of this.foreignKeyMap) {
            const prop = entry[0];
            const referencedTable = entry[1];
            referencedTable.foreignKeyReversedReferences.push({
                table: this,
                prop: prop as string
            });
        }
    }

    findNonNullById(id: any): R {
        const row = this.findById(id);
        if (row === undefined) {
            throw new Error(`There is no row whose id is '${id}'`);
        }
        return row;
    }

    findById(id: any): R | undefined {
        return this.uniqueIndexMap.get(this.idProp)?.get(id);
    }

    findByUniqueProp(prop: keyof R, value: any): R | undefined {
        if (!this.uniqueIndexMap.has(prop)) {
            throw new Error(`'${prop}' is not column of unique index`);
        }
        return this.uniqueIndexMap.get(prop)!.get(value);
    }

    findByProp(prop: keyof R, value: any): R[] {
        return this.find([{prop, value}]);
    }

    find(
        propValuePairs: Array<PropValuePair<R> | undefined>,
        predicate?: Predicate<R>
    ): R[] {
        const unhandledPairs: PropValuePair<R>[] = [];
        let ids: Set<any> | undefined = undefined;
        for (const pair of propValuePairs) {
            if (pair !== undefined) {
                const { prop, value } = pair;
                if (this.uniqueIndexMap.has(prop)) {
                    const row = this.uniqueIndexMap.get(prop)!.get(value);
                    ids = intersection(ids, row !== undefined ? [row[this.idProp]] : []);
                } else if (this.indexMap.has(prop)) {
                    const rows = Array.from(this.indexMap.get(prop)!.get(value)?.values() ?? []);
                    ids = intersection(ids, rows.map(row => row[this.idProp]));
                } else {
                    unhandledPairs.push(pair); 
                }
                if (ids !== undefined && ids.size === 0) {
                    return [];
                }
            }
        }
        const idRowMap = this.uniqueIndexMap.get(this.idProp)!;
        const rows = ids !== undefined ?
            Array.from(ids).map(id => idRowMap.get(id)!) :
            Array.from(idRowMap.values());
        if (predicate === undefined && unhandledPairs.length === 0) {
            return rows;
        }
        return rows.filter(row => {
            if (predicate !== undefined && !predicate(row)) {
                return false;
            }
            for (const unhandledPair of unhandledPairs) {
                if (row[unhandledPair.prop] !== unhandledPair.value) {
                    return false;
                }
            }
            return true;
        });
    }

    insert(row: R, onDuplicateUpdate: boolean = false): this {
        const id = row[this.idProp];
        if (id === undefined) {
            throw new Error("Cannot insert row without id");
        }
        const oldRow = this.findById(id);
        if (oldRow !== undefined && !onDuplicateUpdate) {
            throw new Error(`Cannot insert the row with the duplicated id '${id}'`);
        }
        this.mutate(oldRow, row);
        return this;
    }

    batchInsert(rows: R[], onDuplicateUpdate: boolean = false): this {
        for (const row of rows) {
            this.insert(row);
        }
        return this;
    }

    update(row: R): number {
        const id = row[this.idProp];
        const oldRow = this.findById(id);
        if (oldRow === undefined) {
            return 0;
        }
        this.mutate(oldRow, row);
        return 1;
    }

    delete(id: any): number {
        const oldRow = this.findById(id);
        if (oldRow === undefined) {
            return 0;
        }
        this.mutate(oldRow, undefined);
        return 1;
    }

    private mutate(oldRow: R | undefined, newRow: R | undefined) {

        const id = newRow !== undefined ? 
            newRow[this.idProp] :
            oldRow![this.idProp];

        if (newRow === undefined) {
            for (const {table, prop} of this.foreignKeyReversedReferences) {
                const childRows = table.findByProp(prop, id);
                if (childRows.length !== 0) {
                    throw new Error(
                        `Cannot delete the row ${JSON.stringify(oldRow)} of table '${this.name}', ` +
                        `the other table '${table.name}' has some rows ferences this row: ` +
                        JSON.stringify(childRows)
                    );
                }
            }
        } else {
            for (const [prop, table] of this.foreignKeyMap) {
                const foreignKey = newRow[prop];
                if (foreignKey !== undefined) {
                    if (table.findById(foreignKey) === undefined) {
                        throw new Error(
                            `Cannot insert/update the row ${JSON.stringify(newRow)} into table '${this.name}', ` +
                            `its foreign key '${prop}' is '${foreignKey}' but there is no referenced row in table '${table.name}'`
                        );
                    }
                }
            }
        }

        for (const [prop, valueRowMap] of this.uniqueIndexMap) {
            const oldValue = rowValue(oldRow, prop);
            const newValue = rowValue(newRow, prop);
            if (oldRow !== undefined) {
                valueRowMap.delete(oldValue);
            }
            if (newRow !== undefined) {
                valueRowMap.set(newValue, newRow);
            }
        }

        for (const [prop, valueMultiMap] of this.indexMap) {
            const oldValue = rowValue(oldRow, prop);
            const newValue = rowValue(newRow, prop);
            if (oldValue !== newValue) {
                if (oldRow !== undefined) {
                    const oldIdRowMap = valueMultiMap.get(oldValue);
                    if (oldIdRowMap !== undefined) {
                        oldIdRowMap.delete(id);
                        if (oldIdRowMap.size === 0) {
                            valueMultiMap.delete(oldValue);
                        }
                    }
                }
                if (newRow !== undefined) {
                    let newIdRowMap = valueMultiMap.get(newValue);
                    if (newIdRowMap === undefined) {
                        valueMultiMap.set(newValue, newIdRowMap = new Map<any, R>());
                    }
                    newIdRowMap.set(id, newRow);
                }
            }
        }

        console.log(`Table ${this.name} changed-------------------------------------`);
        console.log(`> Old row: ${JSON.stringify(oldRow)}`);
        console.log(`> New row: ${JSON.stringify(newRow)}`);
    }
}

export interface TableArgs<R extends object> {
    readonly name: string,
    readonly idProp: keyof R;
    readonly uniqueIndexs?: Array<keyof R>; // Just a demo, each index has only one column
    readonly indexes?: Array<keyof R>; // Just a demo, each index has only one column
    readonly foreignKeys?: ForeignKeys<R>
}

export class ForeignKeys<R extends object> {
    
    private readonly map = new Map<keyof R, Table<any> | undefined>();

    // Just a demo, each forieng key
    // 1. has only one column
    // 2. can only reference primary key of other table.
    // 3. don't support cascade operations
    add(
        prop: keyof R, 
        referencedTable?: Table<any> //undefined means self
    ): this {
        this.map.set(prop, referencedTable);
        return this;
    }

    toMap(self: Table<R>): ReadonlyMap<keyof R, Table<any>> {
        const resultMap = new Map<keyof R, Table<any>>();
        for (const [prop, table] of this.map) {
            resultMap.set(prop, table ?? self);
        }
        return resultMap;
    }
}

export type Predicate<R> = (row: R) => boolean;

export interface PropValuePair<R> {
    readonly prop: keyof R;
    readonly value: any;
}

interface ForeignKeyReversedReference {
    readonly table: Table<any>,
    readonly prop: string;
}

function rowValue<R>(row: R | undefined, prop: keyof R): any {
    if (row === undefined) {
        return undefined;
    }
    return row[prop];
}

function intersection<T>(
    set: Set<T> | undefined, 
    elements: T[]
): Set<T> {
    if (elements.length === 0) {
        return new Set();
    }
    if (set === undefined) {
        return new Set(elements);
    }
    return new Set(elements.filter(element => set.has(element)));
}