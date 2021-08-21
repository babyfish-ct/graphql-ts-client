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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const EmployeeRepository_1 = require("../dal/EmployeeRepository");
const Employee_1 = require("../model/Employee");
const EmployeeInput_1 = require("../model/EmployeeInput");
const Delay_1 = require("./Delay");
class EmployeeService {
    findEmployees(name, departmentId, supervisorId, mockedErrorProbability) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            /*
             * Mock the network error
             */
            if (mockedErrorProbability !== undefined && mockedErrorProbability > 0) {
                const top = Math.min(mockedErrorProbability, 100);
                if (Math.floor(Math.random() * 100) < top) {
                    throw new Error(`Mocked error by nodejs at '${Date()}'`);
                }
            }
            const lowercaseName = name === null || name === void 0 ? void 0 : name.toLocaleLowerCase();
            return EmployeeRepository_1.employeeTable
                .find([
                departmentId !== undefined ?
                    { prop: "departmentId", value: departmentId } :
                    undefined,
                supervisorId !== undefined ?
                    { prop: "supervisorId", value: supervisorId } :
                    undefined,
            ], lowercaseName !== undefined && lowercaseName !== "" ?
                d => (d.firstName.toLowerCase().indexOf(lowercaseName) !== -1 ||
                    d.lastName.toLowerCase().indexOf(lowercaseName) !== -1) :
                undefined)
                .map(row => new Employee_1.Employee(row))
                .sort((a, b) => a.firstName > b.firstName ? +1 : a.firstName < b.firstName ? -1 : 0);
            ;
        });
    }
    mergeEmployee(input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            for (let suprvisorId = input.supervisorId; suprvisorId !== undefined; suprvisorId = (_a = EmployeeRepository_1.employeeTable.findByUniqueProp("id", suprvisorId)) === null || _a === void 0 ? void 0 : _a.supervisorId) {
                if (suprvisorId === input.id) {
                    throw new Error("Cannot modify the supervisor, it would make the data reference cycle problem if it is allowed");
                }
            }
            EmployeeRepository_1.employeeTable.insert(input, true);
            return new Employee_1.Employee(input);
        });
    }
    deleteEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            return EmployeeRepository_1.employeeTable.delete(id) !== 0 ? id : undefined;
        });
    }
}
__decorate([
    type_graphql_1.Query(() => [Employee_1.Employee]),
    __param(0, type_graphql_1.Arg("name", () => String, { nullable: true })),
    __param(1, type_graphql_1.Arg("departmentId", () => String, { nullable: true })),
    __param(2, type_graphql_1.Arg("supervisorId", () => String, { nullable: true })),
    __param(3, type_graphql_1.Arg("mockedErrorProbability", () => type_graphql_1.Int, { nullable: true }))
], EmployeeService.prototype, "findEmployees", null);
__decorate([
    type_graphql_1.Mutation(() => Employee_1.Employee),
    __param(0, type_graphql_1.Arg("input", () => EmployeeInput_1.EmployeeInput))
], EmployeeService.prototype, "mergeEmployee", null);
__decorate([
    type_graphql_1.Mutation(() => String),
    __param(0, type_graphql_1.Arg("id", () => String))
], EmployeeService.prototype, "deleteEmployee", null);
exports.EmployeeService = EmployeeService;
