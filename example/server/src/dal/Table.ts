export class Table<R extends object> {

    private uniqueIndexMap = new Map<
        keyof R, // Column, this demo only support single column index
        Map<any, R> // Map<Value, Row>
    >();

    private indexMap = new Map<
        keyof R, // Column, this demo only support single column index
        Map<any, Map<any, R>> // Map<Value, Map<Id, Row>>
    >();

    constructor(
        readonly metadata: TableMetadata<R>
    ) {
        for (const uniqueIndex of metadata.uniqueIndexs ?? []) {
            this.uniqueIndexMap.set(uniqueIndex, new Map<any, R>());
        }
        if (!this.uniqueIndexMap.has(metadata.idProp)) {
            this.uniqueIndexMap.set(metadata.idProp, new Map<any, R>());
        }

        for (const index of metadata.indexes ?? []) {
            if (this.uniqueIndexMap.has(index)) {
                throw new Error(`${index} canot be both unique index and generic index`);
            }
            this.indexMap.set(index, new Map<any, Map<any, R>>());
        }
    }

    findById(id: any): R | undefined {
        return this.uniqueIndexMap.get(this.metadata.idProp)?.get(id);
    }

    findByUniqueProp(prop: keyof R, value: any): R | undefined {
        if (!this.uniqueIndexMap.has(prop)) {
            throw new Error(`'${prop}' is not column of unique index`);
        }
        return this.uniqueIndexMap.get(prop)!.get(value);
    }

    findByProp(prop: keyof R, value: any): R[] {
        if (this.uniqueIndexMap.has(prop)) {
            const row = this.uniqueIndexMap.get(prop).get(value);
            return row !== undefined ? [row] : [];
        }
        if (this.indexMap.has(prop)) {
            const idRowMap = this.indexMap.get(prop)!.get(value);
            return idRowMap !== undefined ? Array.from(idRowMap.values()) : [];
        }
        return this.scan(row => row[prop] === value);
    }

    scan(predicate?: Predicate<R>): R[] {
        const rows: R[] = [];
        for (const row of this.uniqueIndexMap.get(this.metadata.idProp)!.values()) {
            if (predicate === undefined || predicate(row)) {
                rows.push(row);
            }
        }
        return rows;
    }

    insert(row: R, onDuplicateUpdate: boolean = false): this {
        const id = row[this.metadata.idProp];
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
        const id = row[this.metadata.idProp];
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
            newRow[this.metadata.idProp] :
            oldRow[this.metadata.idProp];

        for (const entry of this.uniqueIndexMap) {
            const prop = entry[0];
            const oldValue = rowValue(oldRow, prop);
            const newValue = rowValue(newRow, prop);
            if (oldValue !== newValue) {
                const valueRowMap = entry[1];
                valueRowMap.delete(oldValue);
                valueRowMap.set(newValue, newRow);
            }
        }

        for (const entry of this.indexMap) {
            const prop = entry[0];
            const oldValue = rowValue(oldRow, prop);
            const newValue = rowValue(newRow, prop);
            if (oldValue !== newValue) {
                const valueMultiMap = entry[1];
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
    }
}

export interface TableMetadata<R> {
    readonly idProp: keyof R;
    readonly uniqueIndexs?: Array<keyof R>; // Just a demo, each index has only one column
    readonly indexes?: Array<keyof R>; // Just a demo, each index has only one column
}

export type Predicate<R> = (row: R) => boolean;

function rowValue<R>(row: R | undefined, prop: keyof R): any {
    if (row === undefined) {
        return undefined;
    }
    return row[prop];
}