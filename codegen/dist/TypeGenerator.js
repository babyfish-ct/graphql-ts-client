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
exports.generateType = void 0;
const graphql_1 = require("graphql");
const fs_1 = require("fs");
const TypeLocation_1 = require("./TypeLocation");
const ObjectTypeWriter_1 = require("./ObjectTypeWriter");
const fs_2 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
function generateType(type, config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const [dir, fileName] = (_a = TypeLocation_1.typeLocation(type, config)) !== null && _a !== void 0 ? _a : [];
        if (dir !== undefined) {
            if (!(yield existsAsync(dir))) {
                yield mkdirAsync(dir);
            }
            const stream = fs_1.createWriteStream(path_1.join(dir, fileName));
            if (type instanceof graphql_1.GraphQLObjectType) {
                new ObjectTypeWriter_1.ObjectTypeWriter(type, stream, config).write();
            }
            stream.end();
        }
    });
}
exports.generateType = generateType;
const mkdirAsync = util_1.promisify(fs_2.mkdir);
const existsAsync = util_1.promisify(fs_2.exists);
