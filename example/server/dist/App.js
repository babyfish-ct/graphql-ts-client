"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_graphql_1 = require("express-graphql");
const DepartmentService_1 = require("./bll/DepartmentService");
const Department_1 = require("./model/Department");
const Employee_1 = require("./model/Employee");
const Gender_1 = require("./model/Gender");
const EmployeeService_1 = require("./bll/EmployeeService");
type_graphql_1.registerEnumType(Gender_1.Gender, { name: "Gender" });
const schema = type_graphql_1.buildSchemaSync({
    resolvers: [
        Department_1.DepartmentResolver,
        Employee_1.EmployeeResolver,
        DepartmentService_1.DepartmentService,
        EmployeeService_1.EmployeeService
    ]
});
express_1.default()
    .use(cors_1.default())
    .use('/graphql', express_graphql_1.graphqlHTTP({
    schema,
    graphiql: true
}))
    .listen(8080, () => {
    console.log("GraphQL server is started, please access http://localhost:8080/graphql");
});
