"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeLocation = void 0;
const graphql_1 = require("graphql");
const path_1 = require("path");
const FetcherWriter_1 = require("./FetcherWriter");
function typeLocation(type, config) {
    var _a;
    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
        return [
            path_1.join(config.targetDir, "fetchers"),
            `${type.name}${(_a = config.fetcherSuffix) !== null && _a !== void 0 ? _a : FetcherWriter_1.DEFAULT_FETCHER_SUBFFIX}.ts`
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
