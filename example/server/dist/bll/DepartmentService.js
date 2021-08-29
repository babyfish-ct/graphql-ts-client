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
exports.DepartmentService = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const DepartmentRepostiory_1 = require("../dal/DepartmentRepostiory");
const Department_1 = require("../model/Department");
const DepartmentInput_1 = require("../model/DepartmentInput");
const Delay_1 = require("./Delay");
class DepartmentService {
    findDepartmentsLikeName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            const lowercaseName = name === null || name === void 0 ? void 0 : name.toLocaleLowerCase();
            const predicate = lowercaseName !== undefined && lowercaseName !== "" ?
                d => d.name.toLowerCase().indexOf(lowercaseName) !== -1 :
                undefined;
            return DepartmentRepostiory_1.departmentTable
                .find([], predicate)
                .map(row => new Department_1.Department(row))
                .sort((a, b) => a.name > b.name ? +1 : a.name < b.name ? -1 : 0);
        });
    }
    mergeDepartment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            DepartmentRepostiory_1.departmentTable.insert(input, true);
            return new Department_1.Department(input);
        });
    }
    deleteDepartment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * Mock the network delay
             */
            yield Delay_1.delay(1000);
            return DepartmentRepostiory_1.departmentTable.delete(id) !== 0 ? id : undefined;
        });
    }
}
__decorate([
    type_graphql_1.Query(() => [Department_1.Department]),
    __param(0, type_graphql_1.Arg("name", () => String, { nullable: true }))
], DepartmentService.prototype, "findDepartmentsLikeName", null);
__decorate([
    type_graphql_1.Mutation(() => Department_1.Department),
    __param(0, type_graphql_1.Arg("input", () => DepartmentInput_1.DepartmentInput))
], DepartmentService.prototype, "mergeDepartment", null);
__decorate([
    type_graphql_1.Mutation(() => type_graphql_1.ID),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.ID))
], DepartmentService.prototype, "deleteDepartment", null);
exports.DepartmentService = DepartmentService;
