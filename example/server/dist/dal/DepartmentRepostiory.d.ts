/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import { Table } from "./Table";
export declare const departmentTable: Table<TDepartment>;
export interface TDepartment {
    readonly id: number;
    readonly name: string;
}
