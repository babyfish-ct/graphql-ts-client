"use strict";
/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
var Gender;
(function (Gender) {
    Gender[Gender["MALE"] = 0] = "MALE";
    Gender[Gender["FEMALE"] = 1] = "FEMALE";
})(Gender = exports.Gender || (exports.Gender = {}));
type_graphql_1.registerEnumType(Gender, { name: "Gender" });
