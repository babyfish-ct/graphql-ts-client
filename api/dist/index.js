"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceNullValues = exports.createFetcher = exports.AbstractFetcher = void 0;
var Fetcher_1 = require("./Fetcher");
Object.defineProperty(exports, "AbstractFetcher", { enumerable: true, get: function () { return Fetcher_1.AbstractFetcher; } });
var FetcherProxy_1 = require("./FetcherProxy");
Object.defineProperty(exports, "createFetcher", { enumerable: true, get: function () { return FetcherProxy_1.createFetcher; } });
var util_1 = require("./util");
Object.defineProperty(exports, "replaceNullValues", { enumerable: true, get: function () { return util_1.replaceNullValues; } });
