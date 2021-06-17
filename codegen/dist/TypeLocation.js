"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeLocation = void 0;
const graphql_1 = require("graphql");
const path_1 = require("path");
function typeLocation(type, config) {
    if (type instanceof graphql_1.GraphQLObjectType) {
        return [
            path_1.join(config.targetDir, "objects"),
            `${type.name}Fetcher.ts`
        ];
    }
    if (type instanceof graphql_1.GraphQLEnumType) {
        return [
            path_1.join(config.targetDir, "enums"),
            `${type.name}.ts`
        ];
    }
    if (type instanceof graphql_1.GraphQLInputObjectType) {
        return [
            path_1.join(config.targetDir, "inputs"),
            `${type.name}.ts`
        ];
    }
    return undefined;
}
exports.typeLocation = typeLocation;
