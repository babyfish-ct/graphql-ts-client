/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import { Table } from "./Table";

export const departmentTable =
    new Table<TDepartment>({
        name: "department",
        idProp: "id",
        uniqueIndexs: ["name"]
    })
    .batchInsert([
        {id: 1, name: "Develop"},
        {id: 2, name: "Test"},
        {id: 3, name: "Market"},
        {id: 4, name: "Operation"},
        {id: 5, name: "HR"},
    ]);

export interface TDepartment {
    readonly id: number;
    readonly name: string;
}
