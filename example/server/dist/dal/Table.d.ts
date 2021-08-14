/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
export declare class Table<R extends object> {
    private name;
    private idProp;
    private uniqueIndexMap;
    private indexMap;
    private foreignKeyMap;
    private foreignKeyReversedReferences;
    constructor(args: TableArgs<R>);
    findNonNullById(id: any): R;
    findById(id: any): R | undefined;
    findByUniqueProp(prop: keyof R, value: any): R | undefined;
    findByProp(prop: keyof R, value: any): R[];
    find(propValuePairs: Array<PropValuePair<R> | undefined>, predicate?: Predicate<R>): R[];
    insert(row: R, onDuplicateUpdate?: boolean): this;
    batchInsert(rows: R[], onDuplicateUpdate?: boolean): this;
    update(row: R): number;
    delete(id: any): number;
    private mutate;
}
export interface TableArgs<R extends object> {
    readonly name: string;
    readonly idProp: keyof R;
    readonly uniqueIndexs?: Array<keyof R>;
    readonly indexes?: Array<keyof R>;
    readonly foreignKeys?: ForeignKeys<R>;
}
export declare class ForeignKeys<R extends object> {
    private readonly map;
    add(prop: keyof R, referencedTable?: Table<any>): this;
    toMap(self: Table<R>): ReadonlyMap<keyof R, Table<any>>;
}
export declare type Predicate<R> = (row: R) => boolean;
export interface PropValuePair<R> {
    readonly prop: keyof R;
    readonly value: any;
}
