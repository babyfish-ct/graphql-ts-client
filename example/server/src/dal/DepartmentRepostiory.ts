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
        {id: "d38c10da-6be8-4924-b9b9-5e81899612a0", name: "Develop"},
        {id: "2fa3955e-3e83-49b9-902e-0465c109c779", name: "Test"},
        {id: "170e28b0-f572-46e1-93e1-8d34935ef811", name: "Market"},
        {id: "7db8e259-011f-46ef-b0dd-bf5e4e303702", name: "Operation"},
        {id: "0d43572b-732d-4899-a994-63c918994305", name: "HR"},
    ]);

export interface TDepartment {
    readonly id: string;
    readonly name: string;
}
