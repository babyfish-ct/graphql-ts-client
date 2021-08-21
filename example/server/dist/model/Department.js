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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentResolver = exports.Department = void 0;
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
};
__decorate([
    type_graphql_1.Field(() => String)
], Department.prototype, "name", void 0);
Department = __decorate([
    type_graphql_1.ObjectType()
], Department);
exports.Department = Department;
/*
 * This simple demo uses data in memory to mock database,
 * so there is no performance issues, "N + 1" query is not a problem
 *
 * That means "Resvoler" is enough and "DataLoader" optimization is unnecessary.
 */
let DepartmentResolver = class DepartmentResolver {
    employees(self) {
        return EmployeeRepository_1.employeeTable
            .findByProp("departmentId", self.id)
            .map(row => new Employee_1.Employee(row));
    }
    avgSalary(self) {
        const arr = EmployeeRepository_1.employeeTable
            .findByProp("departmentId", self.id)
            .map(row => row.salary);
        return arr.length !== 0 ?
            arr.reduce((p, c) => p + c, 0) / arr.length :
            0;
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => [Employee_1.Employee]),
    __param(0, type_graphql_1.Root())
], DepartmentResolver.prototype, "employees", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Float),
    __param(0, type_graphql_1.Root())
], DepartmentResolver.prototype, "avgSalary", null);
DepartmentResolver = __decorate([
    type_graphql_1.Resolver(Department)
], DepartmentResolver);
exports.DepartmentResolver = DepartmentResolver;
