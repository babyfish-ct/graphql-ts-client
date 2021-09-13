"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayGenerator = exports.ApolloGenerator = exports.AsyncGenerator = exports.Generator = exports.loadLocalSchema = exports.loadRemoteSchema = void 0;
var SchemaLoader_1 = require("./SchemaLoader");
Object.defineProperty(exports, "loadRemoteSchema", { enumerable: true, get: function () { return SchemaLoader_1.loadRemoteSchema; } });
Object.defineProperty(exports, "loadLocalSchema", { enumerable: true, get: function () { return SchemaLoader_1.loadLocalSchema; } });
var Generator_1 = require("./Generator");
Object.defineProperty(exports, "Generator", { enumerable: true, get: function () { return Generator_1.Generator; } });
var AsyncGenerator_1 = require("./async/AsyncGenerator");
Object.defineProperty(exports, "AsyncGenerator", { enumerable: true, get: function () { return AsyncGenerator_1.AsyncGenerator; } });
var ApolloGenerator_1 = require("./apollo/ApolloGenerator");
Object.defineProperty(exports, "ApolloGenerator", { enumerable: true, get: function () { return ApolloGenerator_1.ApolloGenerator; } });
var RelayGenerator_1 = require("./relay/RelayGenerator");
Object.defineProperty(exports, "RelayGenerator", { enumerable: true, get: function () { return RelayGenerator_1.RelayGenerator; } });
