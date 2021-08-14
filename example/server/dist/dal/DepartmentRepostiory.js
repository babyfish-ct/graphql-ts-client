"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentTable = void 0;
const Table_1 = require("./Table");
exports.departmentTable = new Table_1.Table({
    name: "department",
    idProp: "id",
    uniqueIndexs: ["name"]
})
    .batchInsert([
    { id: 1, name: "Develop" },
    { id: 2, name: "Test" },
    { id: 3, name: "Market" },
    { id: 4, name: "Operation" },
    { id: 5, name: "HR" },
]);
