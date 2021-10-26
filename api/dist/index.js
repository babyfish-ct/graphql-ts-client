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
exports.util = exports.createFetcher = exports.DependencyManager = exports.TextWriter = exports.ParameterRef = exports.StringValue = exports.SpreadFragment = exports.AbstractFetcher = exports.createFetchableType = void 0;
var Fetchable_1 = require("./Fetchable");
Object.defineProperty(exports, "createFetchableType", { enumerable: true, get: function () { return Fetchable_1.createFetchableType; } });
var Fetcher_1 = require("./Fetcher");
Object.defineProperty(exports, "AbstractFetcher", { enumerable: true, get: function () { return Fetcher_1.AbstractFetcher; } });
Object.defineProperty(exports, "SpreadFragment", { enumerable: true, get: function () { return Fetcher_1.SpreadFragment; } });
Object.defineProperty(exports, "StringValue", { enumerable: true, get: function () { return Fetcher_1.StringValue; } });
var Parameter_1 = require("./Parameter");
Object.defineProperty(exports, "ParameterRef", { enumerable: true, get: function () { return Parameter_1.ParameterRef; } });
var TextWriter_1 = require("./TextWriter");
Object.defineProperty(exports, "TextWriter", { enumerable: true, get: function () { return TextWriter_1.TextWriter; } });
var DependencyManager_1 = require("./DependencyManager");
Object.defineProperty(exports, "DependencyManager", { enumerable: true, get: function () { return DependencyManager_1.DependencyManager; } });
var FetcherProxy_1 = require("./FetcherProxy");
Object.defineProperty(exports, "createFetcher", { enumerable: true, get: function () { return FetcherProxy_1.createFetcher; } });
const Md5_1 = require("./util/Md5");
const NullValues_1 = require("./util/NullValues");
const MapIterator_1 = require("./util/MapIterator");
exports.util = { toMd5: Md5_1.toMd5, exceptNullValues: NullValues_1.exceptNullValues, iterateMap: MapIterator_1.iterateMap };
