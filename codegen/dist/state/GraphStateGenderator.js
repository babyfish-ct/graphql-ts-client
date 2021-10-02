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
exports.GraphStateGenerator = void 0;
const path_1 = require("path");
const Generator_1 = require("../Generator");
const TypedConfigurationWriter_1 = require("./TypedConfigurationWriter");
class GraphStateGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(ctx, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateAsync(ctx));
        });
    }
    generateAsync(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "TypedConfiguration.ts"));
            new TypedConfigurationWriter_1.TypedConfigurationWriter(ctx, stream, this.config).write();
            yield Generator_1.closeStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        return __awaiter(this, void 0, void 0, function* () {
            stream.write(`export type { newTypedConfiguration } from "./TypedConfiguration";\n`);
            yield _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.GraphStateGenerator = GraphStateGenerator;
