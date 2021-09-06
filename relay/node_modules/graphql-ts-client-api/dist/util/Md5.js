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
exports.toMd5 = void 0;
const ts_md5_1 = require("ts-md5");
function toMd5(value) {
    const md5 = new ts_md5_1.Md5();
    md5.appendStr(value);
    return md5.end();
}
exports.toMd5 = toMd5;
