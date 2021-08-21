"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForeignKeys = exports.Table = void 0;
class Table {
    constructor(args) {
        var _a, _b, _c, _d;
        this.uniqueIndexMap = new Map();
        this.indexMap = new Map();
        this.foreignKeyReversedReferences = [];
        this.name = args.name;
        this.idProp = args.idProp;
        for (const uniqueIndex of (_a = args.uniqueIndexs) !== null && _a !== void 0 ? _a : []) {
            this.uniqueIndexMap.set(uniqueIndex, new Map());
        }
        if (!this.uniqueIndexMap.has(args.idProp)) {
            this.uniqueIndexMap.set(args.idProp, new Map());
        }
        for (const index of (_b = args.indexes) !== null && _b !== void 0 ? _b : []) {
            if (this.uniqueIndexMap.has(index)) {
                throw new Error(`${index} canot be both unique index and generic index`);
            }
            this.indexMap.set(index, new Map());
        }
        this.foreignKeyMap = (_d = (_c = args.foreignKeys) === null || _c === void 0 ? void 0 : _c.toMap(this)) !== null && _d !== void 0 ? _d : new Map();
        for (const entry of this.foreignKeyMap) {
            const prop = entry[0];
            const referencedTable = entry[1];
            referencedTable.foreignKeyReversedReferences.push({
                table: this,
                prop: prop
            });
        }
    }
    findNonNullById(id) {
        const row = this.findById(id);
        if (row === undefined) {
            throw new Error(`There is no row whose id is '${id}'`);
        }
        return row;
    }
    findById(id) {
        var _a;
        return (_a = this.uniqueIndexMap.get(this.idProp)) === null || _a === void 0 ? void 0 : _a.get(id);
    }
    findByUniqueProp(prop, value) {
        if (!this.uniqueIndexMap.has(prop)) {
            throw new Error(`'${prop}' is not column of unique index`);
        }
        return this.uniqueIndexMap.get(prop).get(value);
    }
    findByProp(prop, value) {
        return this.find([{ prop, value }]);
    }
    find(propValuePairs, predicate) {
        var _a, _b;
        const unhandledPairs = [];
        let ids = undefined;
        for (const pair of propValuePairs) {
            if (pair !== undefined) {
                const { prop, value } = pair;
                if (this.uniqueIndexMap.has(prop)) {
                    const row = this.uniqueIndexMap.get(prop).get(value);
                    ids = intersection(ids, row !== undefined ? [row[this.idProp]] : []);
                }
                else if (this.indexMap.has(prop)) {
                    const rows = Array.from((_b = (_a = this.indexMap.get(prop).get(value)) === null || _a === void 0 ? void 0 : _a.values()) !== null && _b !== void 0 ? _b : []);
                    ids = intersection(ids, rows.map(row => row[this.idProp]));
                }
                else {
                    unhandledPairs.push(pair);
                }
                if (ids !== undefined && ids.size === 0) {
                    return [];
                }
            }
        }
        const idRowMap = this.uniqueIndexMap.get(this.idProp);
        const rows = ids !== undefined ?
            Array.from(ids).map(id => idRowMap.get(id)) :
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
    insert(row, onDuplicateUpdate = false) {
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
    batchInsert(rows, onDuplicateUpdate = false) {
        for (const row of rows) {
            this.insert(row);
        }
        return this;
    }
    update(row) {
        const id = row[this.idProp];
        const oldRow = this.findById(id);
        if (oldRow === undefined) {
            return 0;
        }
        this.mutate(oldRow, row);
        return 1;
    }
    delete(id) {
        const oldRow = this.findById(id);
        if (oldRow === undefined) {
            return 0;
        }
        this.mutate(oldRow, undefined);
        return 1;
    }
    mutate(oldRow, newRow) {
        const id = newRow !== undefined ?
            newRow[this.idProp] :
            oldRow[this.idProp];
        if (newRow === undefined) {
            for (const { table, prop } of this.foreignKeyReversedReferences) {
                const childRows = table.findByProp(prop, id);
                if (childRows.length !== 0) {
                    throw new Error(`Cannot delete the row ${JSON.stringify(oldRow)} of table '${this.name}', ` +
                        `the other table '${table.name}' has some rows ferences this row: ` +
                        JSON.stringify(childRows));
                }
            }
        }
        else {
            for (const [prop, table] of this.foreignKeyMap) {
                const foreignKey = newRow[prop];
                if (foreignKey !== undefined) {
                    if (table.findById(foreignKey) === undefined) {
                        throw new Error(`Cannot insert/update the row ${JSON.stringify(newRow)} into table '${this.name}', ` +
                            `its foreign key '${prop}' is '${foreignKey}' but there is no referenced row in table '${table.name}'`);
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
                        valueMultiMap.set(newValue, newIdRowMap = new Map());
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
exports.Table = Table;
class ForeignKeys {
    constructor() {
        this.map = new Map();
    }
    // Just a demo, each forieng key
    // 1. has only one column
    // 2. can only reference primary key of other table.
    // 3. don't support cascade operations
    add(prop, referencedTable //undefined means self
    ) {
        this.map.set(prop, referencedTable);
        return this;
    }
    toMap(self) {
        const resultMap = new Map();
        for (const [prop, table] of this.map) {
            resultMap.set(prop, table !== null && table !== void 0 ? table : self);
        }
        return resultMap;
    }
}
exports.ForeignKeys = ForeignKeys;
function rowValue(row, prop) {
    if (row === undefined) {
        return undefined;
    }
    return row[prop];
}
function intersection(set, elements) {
    if (elements.length === 0) {
        return new Set();
    }
    if (set === undefined) {
        return new Set(elements);
    }
    return new Set(elements.filter(element => set.has(element)));
}
