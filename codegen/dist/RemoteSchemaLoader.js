"use strict";
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
exports.loadRemoteSchema = void 0;
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
