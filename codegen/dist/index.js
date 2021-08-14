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
exports.loadRemoteSchema = exports.ApolloGenerator = exports.AsyncGenerator = exports.Generator = void 0;
var Generator_1 = require("./Generator");
Object.defineProperty(exports, "Generator", { enumerable: true, get: function () { return Generator_1.Generator; } });
var AsyncGenerator_1 = require("./async/AsyncGenerator");
Object.defineProperty(exports, "AsyncGenerator", { enumerable: true, get: function () { return AsyncGenerator_1.AsyncGenerator; } });
var ApolloGenerator_1 = require("./apollo/ApolloGenerator");
Object.defineProperty(exports, "ApolloGenerator", { enumerable: true, get: function () { return ApolloGenerator_1.ApolloGenerator; } });
var RemoteSchemaLoader_1 = require("./RemoteSchemaLoader");
Object.defineProperty(exports, "loadRemoteSchema", { enumerable: true, get: function () { return RemoteSchemaLoader_1.loadRemoteSchema; } });
