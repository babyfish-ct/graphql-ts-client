/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import { Gender } from "../model/Gender";
import { departmentTable } from "./DepartmentRepostiory";
import { ForeignKeys, Table } from "./Table";

export const employeeTable =
    new Table<TEmployee>({
        name: 'employee',
        idProp: "id",
        indexes: ["departmentId", "supervisorId"],
        foreignKeys: new ForeignKeys<TEmployee>()
            .add("departmentId", departmentTable)
            .add("supervisorId", undefined)
    })
    .batchInsert([
        {
            id: 1, 
            firstName: "Malloy", 
            lastName: "Carter", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 1
        },
        {
            id: 2, 
            firstName: "Teresa", 
            lastName: "Longman", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 1,
            supervisorId: 1
        },
        {
            id: 3, 
            firstName: "Benjamin", 
            lastName: "Hawk", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 1,
            supervisorId: 1
        },

        {
            id: 4, 
            firstName: "Kelley", 
            lastName: "White", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 2
        },
        {
            id: 5, 
            firstName: "Foster", 
            lastName: "Churchill", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 2,
            supervisorId: 4
        },
        {
            id: 6, 
            firstName: "Juliana", 
            lastName: "Wood", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 2,
            supervisorId: 4
        },

        {
            id: 7, 
            firstName: "Alexander", 
            lastName: "Sterling", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 3
        },
        {
            id: 8, 
            firstName: "Victoria", 
            lastName: "London", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 3,
            supervisorId: 7
        },
        {
            id: 9, 
            firstName: "Phillips", 
            lastName: "Bush", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 3,
            supervisorId: 7
        },

        {
            id: 10, 
            firstName: "Gillian", 
            lastName: "Reed", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 4
        },
        {
            id: 11, 
            firstName: "Reynolds", 
            lastName: "Atkinson", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 4,
            supervisorId: 10
        },
        {
            id: 12, 
            firstName: "Stephanie", 
            lastName: "Forest", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 4,
            supervisorId: 10
        },

        {
            id: 13, 
            firstName: "Eaton", 
            lastName: "Webster", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 5
        },
        {
            id: 14, 
            firstName: "Zenobia", 
            lastName: "Sharp", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: 5,
            supervisorId: 13
        },
        {
            id: 15, 
            firstName: "Norton", 
            lastName: "Cotton", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: 5,
            supervisorId: 13
        },
    ]);

export interface TEmployee {
    readonly id: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly gender: Gender,
    readonly salary: number;
    readonly departmentId: number;
    readonly supervisorId?: number;
}