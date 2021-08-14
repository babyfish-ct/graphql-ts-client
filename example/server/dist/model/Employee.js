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
exports.EmployeeResolver = exports.Employee = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const DepartmentRepostiory_1 = require("../dal/DepartmentRepostiory");
const EmployeeRepository_1 = require("../dal/EmployeeRepository");
const Department_1 = require("./Department");
const Gender_1 = require("./Gender");
let Employee = class Employee {
    constructor(row) {
        this.id = row.id;
        this.firstName = row.firstName;
        this.lastName = row.lastName;
        this.gender = row.gender;
        this.salary = row.salary;
        this.departmentId = row.departmentId;
        this.supervisorId = row.supervisorId;
    }
};
__decorate([
    type_graphql_1.Field(() => String)
], Employee.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String)
], Employee.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(() => String)
], Employee.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field(() => Gender_1.Gender)
], Employee.prototype, "gender", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float)
], Employee.prototype, "salary", void 0);
Employee = __decorate([
    type_graphql_1.ObjectType()
], Employee);
exports.Employee = Employee;
/*
 * This simple demo uses data in memory to mock database,
 * so there is no performance issues, "N + 1" query is not a problem
 *
 * That means "Resvoler" is enough and "DataLoader" optimization is unnecessary.
 */
let EmployeeResolver = class EmployeeResolver {
    department(self) {
        return new Department_1.Department(DepartmentRepostiory_1.departmentTable.findNonNullById(self.departmentId));
    }
    supervisor(self) {
        if (self.supervisorId === undefined) {
            return undefined;
        }
        return new Employee(EmployeeRepository_1.employeeTable.findNonNullById(self.supervisorId));
    }
    subordinates(self) {
        return EmployeeRepository_1.employeeTable
            .findByProp("supervisorId", self.id)
            .map(row => new Employee(row));
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => Department_1.Department),
    __param(0, type_graphql_1.Root())
], EmployeeResolver.prototype, "department", null);
__decorate([
    type_graphql_1.FieldResolver(() => Employee, { nullable: true }),
    __param(0, type_graphql_1.Root())
], EmployeeResolver.prototype, "supervisor", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Employee]),
    __param(0, type_graphql_1.Root())
], EmployeeResolver.prototype, "subordinates", null);
EmployeeResolver = __decorate([
    type_graphql_1.Resolver(Employee)
], EmployeeResolver);
exports.EmployeeResolver = EmployeeResolver;
