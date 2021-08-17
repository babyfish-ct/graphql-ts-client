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
            id: "e110c564-23cc-4811-9e81-d587a13db634", 
            firstName: "Malloy", 
            lastName: "Carter", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "d38c10da-6be8-4924-b9b9-5e81899612a0"
        },
        {
            id: "8f30bc8a-49f9-481d-beca-5fe2d147c831", 
            firstName: "Teresa", 
            lastName: "Longman", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "d38c10da-6be8-4924-b9b9-5e81899612a0",
            supervisorId: "e110c564-23cc-4811-9e81-d587a13db634"
        },
        {
            id: "914c8595-35cb-4f67-bbc7-8029e9e6245a", 
            firstName: "Benjamin", 
            lastName: "Hawk", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "d38c10da-6be8-4924-b9b9-5e81899612a0",
            supervisorId: "e110c564-23cc-4811-9e81-d587a13db634"
        },

        {
            id: "a62f7aa3-9490-4612-98b5-98aae0e77120", 
            firstName: "Kelley", 
            lastName: "White", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "2fa3955e-3e83-49b9-902e-0465c109c779"
        },
        {
            id: "77880489-eb41-41da-a1f2-ee3ce5f5b5cb", 
            firstName: "Foster", 
            lastName: "Churchill", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "2fa3955e-3e83-49b9-902e-0465c109c779",
            supervisorId: "a62f7aa3-9490-4612-98b5-98aae0e77120"
        },
        {
            id: "a130bc47-ef94-4827-9872-f7956c09d62c", 
            firstName: "Juliana", 
            lastName: "Wood", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "2fa3955e-3e83-49b9-902e-0465c109c779",
            supervisorId: "a62f7aa3-9490-4612-98b5-98aae0e77120"
        },

        {
            id: "efa8ed2c-b00d-40e7-ba5d-5118178d0bc9", 
            firstName: "Alexander", 
            lastName: "Sterling", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "170e28b0-f572-46e1-93e1-8d34935ef811"
        },
        {
            id: "8", 
            firstName: "Victoria", 
            lastName: "London", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "170e28b0-f572-46e1-93e1-8d34935ef811",
            supervisorId: "efa8ed2c-b00d-40e7-ba5d-5118178d0bc9"
        },
        {
            id: "0f5ea2c8-5157-4019-8437-c9b3691863cf", 
            firstName: "Phillips", 
            lastName: "Bush", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "170e28b0-f572-46e1-93e1-8d34935ef811",
            supervisorId: "efa8ed2c-b00d-40e7-ba5d-5118178d0bc9"
        },

        {
            id: "dfd18278-dfe6-400e-8046-08f4889ace3d", 
            firstName: "Gillian", 
            lastName: "Reed", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "7db8e259-011f-46ef-b0dd-bf5e4e303702"
        },
        {
            id: "40c7b862-0e92-4bdb-a79a-da8b6b471d34", 
            firstName: "Reynolds", 
            lastName: "Atkinson", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "7db8e259-011f-46ef-b0dd-bf5e4e303702",
            supervisorId: "dfd18278-dfe6-400e-8046-08f4889ace3d"
        },
        {
            id: "2fcc4af7-212b-4888-aef1-20a64dfc5d30", 
            firstName: "Stephanie", 
            lastName: "Forest", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "7db8e259-011f-46ef-b0dd-bf5e4e303702",
            supervisorId: "dfd18278-dfe6-400e-8046-08f4889ace3d"
        },

        {
            id: "dee43b89-390b-4f13-837c-7c0f04c75a17", 
            firstName: "Eaton", 
            lastName: "Webster", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "0d43572b-732d-4899-a994-63c918994305"
        },
        {
            id: "c2edb2d5-a99c-41f5-b49a-864d6f3c4efc", 
            firstName: "Zenobia", 
            lastName: "Sharp", 
            gender: Gender.FEMALE,
            salary: 0,
            departmentId: "0d43572b-732d-4899-a994-63c918994305",
            supervisorId: "dee43b89-390b-4f13-837c-7c0f04c75a17"
        },
        {
            id: "7dd9e873-1fa0-4f0b-9755-345d39127d87", 
            firstName: "Norton", 
            lastName: "Cotton", 
            gender: Gender.MALE,
            salary: 0,
            departmentId: "0d43572b-732d-4899-a994-63c918994305",
            supervisorId: "dee43b89-390b-4f13-837c-7c0f04c75a17"
        },
    ]);

export interface TEmployee {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly gender: Gender,
    readonly salary: number;
    readonly departmentId: string;
    readonly supervisorId?: string;
}