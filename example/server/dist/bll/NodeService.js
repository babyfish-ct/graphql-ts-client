"use strict";
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
exports.NodeService = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const DepartmentRepostiory_1 = require("../dal/DepartmentRepostiory");
const EmployeeRepository_1 = require("../dal/EmployeeRepository");
const Department_1 = require("../model/Department");
const Employee_1 = require("../model/Employee");
const Node_1 = require("../model/Node");
const Delay_1 = require("./Delay");
class NodeService {
    node(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Delay_1.delay(1000);
            const departmentRow = DepartmentRepostiory_1.departmentTable.findById(id);
            if (departmentRow !== undefined) {
                return new Department_1.Department(departmentRow);
            }
            const employeeRow = EmployeeRepository_1.employeeTable.findById(id);
            if (employeeRow !== undefined) {
                return new Employee_1.Employee(employeeRow);
            }
            return undefined;
        });
    }
}
__decorate([
    type_graphql_1.Query(() => Node_1.Node, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.ID))
], NodeService.prototype, "node", null);
exports.NodeService = NodeService;
