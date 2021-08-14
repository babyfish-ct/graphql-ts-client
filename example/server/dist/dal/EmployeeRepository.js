"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeTable = void 0;
const Gender_1 = require("../model/Gender");
const DepartmentRepostiory_1 = require("./DepartmentRepostiory");
const Table_1 = require("./Table");
exports.employeeTable = new Table_1.Table({
    name: 'employee',
    idProp: "id",
    indexes: ["departmentId", "supervisorId"],
    foreignKeys: new Table_1.ForeignKeys()
        .add("departmentId", DepartmentRepostiory_1.departmentTable)
        .add("supervisorId", undefined)
})
    .batchInsert([
    {
        id: "1",
        firstName: "Malloy",
        lastName: "Carter",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 1
    },
    {
        id: "2",
        firstName: "Teresa",
        lastName: "Longman",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 1,
        supervisorId: "1"
    },
    {
        id: "3",
        firstName: "Benjamin",
        lastName: "Hawk",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 1,
        supervisorId: "1"
    },
    {
        id: "4",
        firstName: "Kelley",
        lastName: "White",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 2
    },
    {
        id: "5",
        firstName: "Foster",
        lastName: "Churchill",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 2,
        supervisorId: "4"
    },
    {
        id: "6",
        firstName: "Juliana",
        lastName: "Wood",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 2,
        supervisorId: "4"
    },
    {
        id: "7",
        firstName: "Alexander",
        lastName: "Sterling",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 3
    },
    {
        id: "8",
        firstName: "Victoria",
        lastName: "London",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 3,
        supervisorId: "7"
    },
    {
        id: "9",
        firstName: "Phillips",
        lastName: "Bush",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 3,
        supervisorId: "7"
    },
    {
        id: "10",
        firstName: "Gillian",
        lastName: "Reed",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 4
    },
    {
        id: "11",
        firstName: "Reynolds",
        lastName: "Atkinson",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 4,
        supervisorId: "10"
    },
    {
        id: "12",
        firstName: "Stephanie",
        lastName: "Forest",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 4,
        supervisorId: "10"
    },
    {
        id: "13",
        firstName: "Eaton",
        lastName: "Webster",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 5
    },
    {
        id: "14",
        firstName: "Zenobia",
        lastName: "Sharp",
        gender: Gender_1.Gender.FEMALE,
        salary: 0,
        departmentId: 5,
        supervisorId: "13"
    },
    {
        id: "15",
        firstName: "Norton",
        lastName: "Cotton",
        gender: Gender_1.Gender.MALE,
        salary: 0,
        departmentId: 5,
        supervisorId: "13"
    },
]);
