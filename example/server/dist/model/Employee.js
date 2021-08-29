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
var Employee_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const DepartmentRepostiory_1 = require("../dal/DepartmentRepostiory");
const EmployeeRepository_1 = require("../dal/EmployeeRepository");
const Department_1 = require("./Department");
const Gender_1 = require("./Gender");
const Node_1 = require("./Node");
let Employee = Employee_1 = class Employee extends Node_1.Node {
    constructor(row) {
        super(row.id);
        this.firstName = row.firstName;
        this.lastName = row.lastName;
        this.gender = row.gender;
        this.salary = row.salary;
        this.departmentId = row.departmentId;
        this.supervisorId = row.supervisorId;
    }
    department() {
        return new Department_1.Department(DepartmentRepostiory_1.departmentTable.findNonNullById(this.departmentId));
    }
    supervisor() {
        if (this.supervisorId === undefined) {
            return undefined;
        }
        return new Employee_1(EmployeeRepository_1.employeeTable.findNonNullById(this.supervisorId));
    }
    subordinates() {
        return EmployeeRepository_1.employeeTable
            .findByProp("supervisorId", this.id)
            .map(row => new Employee_1(row));
    }
};
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
__decorate([
    type_graphql_1.Field(() => Department_1.Department)
], Employee.prototype, "department", null);
__decorate([
    type_graphql_1.Field(() => Employee_1, { nullable: true })
], Employee.prototype, "supervisor", null);
__decorate([
    type_graphql_1.Field(() => [Employee_1])
], Employee.prototype, "subordinates", null);
Employee = Employee_1 = __decorate([
    type_graphql_1.ObjectType({ implements: Node_1.Node })
], Employee);
exports.Employee = Employee;
