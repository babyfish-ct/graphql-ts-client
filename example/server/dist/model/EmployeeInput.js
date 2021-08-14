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
exports.EmployeeInput = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
let EmployeeInput = class EmployeeInput {
};
__decorate([
    type_graphql_1.Field(() => String)
], EmployeeInput.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String)
], EmployeeInput.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(() => String)
], EmployeeInput.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field(() => String)
], EmployeeInput.prototype, "gender", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float)
], EmployeeInput.prototype, "salary", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int)
], EmployeeInput.prototype, "departmentId", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true })
], EmployeeInput.prototype, "supervisorId", void 0);
EmployeeInput = __decorate([
    type_graphql_1.InputType()
], EmployeeInput);
exports.EmployeeInput = EmployeeInput;
