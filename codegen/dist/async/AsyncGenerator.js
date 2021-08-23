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
exports.AsyncGenerator = void 0;
const AsyncOperationWriter_1 = require("./AsyncOperationWriter");
const AsyncEnvironmentWriter_1 = require("./AsyncEnvironmentWriter");
const Generator_1 = require("../Generator");
const path_1 = require("path");
class AsyncGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(queryFields, mutationFields, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateEnvironment());
            if (queryFields.length !== 0) {
                yield this.mkdirIfNecessary("queries");
                promises.push(this.generateOperations(false, queryFields));
            }
            if (mutationFields.length !== 0) {
                yield this.mkdirIfNecessary("mutations");
                promises.push(this.generateOperations(true, mutationFields));
            }
        });
    }
    generateEnvironment() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Environment.ts"));
            new AsyncEnvironmentWriter_1.AsyncEnvironmentWriter(stream, this.config).write();
            yield Generator_1.awaitStream(stream);
        });
    }
    generateOperations(mutation, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const subDir = mutation ? "mutations" : "queries";
            const promises = fields.map((field) => __awaiter(this, void 0, void 0, function* () {
                const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, subDir, `${field.name}.ts`));
                new AsyncOperationWriter_1.AsyncOperationWriter(mutation, field, stream, this.config).write();
                yield Generator_1.awaitStream(stream);
            }));
            const writeIndex = () => __awaiter(this, void 0, void 0, function* () {
                const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, subDir, "index.ts"));
                for (const field of fields) {
                    stream.write(`export {${field.name}} from './${field.name}';\n`);
                    const argsWrapperName = AsyncOperationWriter_1.argsWrapperTypeName(field);
                    if (argsWrapperName !== undefined) {
                        stream.write(`export type {${argsWrapperName}} from './${field.name}';\n`);
                    }
                }
                stream.end();
            });
            yield Promise.all([
                ...promises,
                writeIndex()
            ]);
        });
    }
}
exports.AsyncGenerator = AsyncGenerator;
