"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const EmployeeRepository_1 = require("../dal/EmployeeRepository");
const Employee_1 = require("./Employee");
const Node_1 = require("./Node");
let Department = class Department extends Node_1.Node {
    constructor(row) {
        super(row.id);
        this.name = row.name;
    }
    employees() {
        return EmployeeRepository_1.employeeTable
            .findByProp("departmentId", this.id)
            .map(row => new Employee_1.Employee(row));
    }
    avgSalary() {
        const arr = EmployeeRepository_1.employeeTable
            .findByProp("departmentId", this.id)
            .map(row => row.salary);
        return arr.length !== 0 ?
            arr.reduce((p, c) => p + c, 0) / arr.length :
            0;
    }
};
__decorate([
    type_graphql_1.Field(() => String)
], Department.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => [Employee_1.Employee])
], Department.prototype, "employees", null);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float)
], Department.prototype, "avgSalary", null);
Department = __decorate([
    type_graphql_1.ObjectType({ implements: Node_1.Node })
], Department);
exports.Department = Department;
