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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocalSchema = exports.loadRemoteSchema = void 0;
const promises_1 = require("fs/promises");
const utilities_1 = require("graphql/utilities");
const utilities_2 = require("graphql/utilities");
const node_fetch_1 = require("node-fetch");
function loadRemoteSchema(endpoint, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ "query": utilities_1.getIntrospectionQuery() });
        const response = yield node_fetch_1.default(endpoint, {
            method: 'POST',
            body,
            headers: Object.assign({ "Accept": "application/json", "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body).toString() }, headers)
        });
        const { data, errors } = yield response.json();
        if (errors !== undefined) {
            throw new Error();
        }
        return utilities_2.buildClientSchema(data);
    });
}
exports.loadRemoteSchema = loadRemoteSchema;
function loadLocalSchema(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const sdl = yield promises_1.readFile(location, { encoding: "utf8" });
        return utilities_1.buildSchema(sdl);
    });
}
exports.loadLocalSchema = loadLocalSchema;
