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
exports.util = exports.createFetchableType = exports.createFetcher = exports.DependencyManager = exports.TextWriter = exports.ParameterRef = exports.StringValue = exports.InvisibleFragment = exports.AbstractFetcher = void 0;
var Fetcher_1 = require("./Fetcher");
Object.defineProperty(exports, "AbstractFetcher", { enumerable: true, get: function () { return Fetcher_1.AbstractFetcher; } });
Object.defineProperty(exports, "InvisibleFragment", { enumerable: true, get: function () { return Fetcher_1.InvisibleFragment; } });
Object.defineProperty(exports, "StringValue", { enumerable: true, get: function () { return Fetcher_1.StringValue; } });
var Parameter_1 = require("./Parameter");
Object.defineProperty(exports, "ParameterRef", { enumerable: true, get: function () { return Parameter_1.ParameterRef; } });
var TextWriter_1 = require("./TextWriter");
Object.defineProperty(exports, "TextWriter", { enumerable: true, get: function () { return TextWriter_1.TextWriter; } });
var DependencyManager_1 = require("./DependencyManager");
Object.defineProperty(exports, "DependencyManager", { enumerable: true, get: function () { return DependencyManager_1.DependencyManager; } });
var FetcherProxy_1 = require("./FetcherProxy");
Object.defineProperty(exports, "createFetcher", { enumerable: true, get: function () { return FetcherProxy_1.createFetcher; } });
Object.defineProperty(exports, "createFetchableType", { enumerable: true, get: function () { return FetcherProxy_1.createFetchableType; } });
const Md5_1 = require("./util/Md5");
const NullValues_1 = require("./util/NullValues");
const MapIterator_1 = require("./util/MapIterator");
const immer_1 = require("immer");
exports.util = { toMd5: Md5_1.toMd5, removeNullValues: NullValues_1.removeNullValues, exceptNullValues: NullValues_1.exceptNullValues, iterateMap: MapIterator_1.iterateMap, produce: immer_1.produce };
