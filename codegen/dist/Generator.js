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
exports.closeStream = exports.createStreamAndLog = exports.Generator = void 0;
const graphql_1 = require("graphql");
const GeneratorConfig_1 = require("./GeneratorConfig");
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const FetcherWriter_1 = require("./FetcherWriter");
const EnumWriter_1 = require("./EnumWriter");
const InputWriter_1 = require("./InputWriter");
const CommonTypesWriter_1 = require("./CommonTypesWriter");
const InheritanceInfo_1 = require("./InheritanceInfo");
class Generator {
    constructor(config) {
        var _a, _b;
        this.config = config;
        GeneratorConfig_1.validateConfig(config);
        this.excludedTypeNames = new Set((_a = config.excludedTypes) !== null && _a !== void 0 ? _a : []);
        this.excludedOperationNames = new Set((_b = config.excludedOperations) !== null && _b !== void 0 ? _b : []);
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = yield this.loadSchema();
            GeneratorConfig_1.validateConfigAndSchema(this.config, schema);
            if (this.config.recreateTargetDir) {
                yield this.rmdirIfNecessary();
            }
            yield this.mkdirIfNecessary();
            const inheritanceInfo = new InheritanceInfo_1.InheritanceInfo(schema);
            const queryType = schema.getQueryType();
            const mutationType = schema.getMutationType();
            const fetcherTypes = [];
            const inputTypes = [];
            const enumTypes = [];
            const typeMap = schema.getTypeMap();
            for (const typeName in typeMap) {
                if (!typeName.startsWith("__") && !this.excludedTypeNames.has(typeName)) {
                    const type = typeMap[typeName];
                    if (type instanceof graphql_1.GraphQLObjectType ||
                        type instanceof graphql_1.GraphQLInterfaceType ||
                        type instanceof graphql_1.GraphQLUnionType) {
                        fetcherTypes.push(type);
                    }
                    else if (type instanceof graphql_1.GraphQLInputObjectType) {
                        inputTypes.push(type);
                    }
                    else if (type instanceof graphql_1.GraphQLEnumType) {
                        enumTypes.push(type);
                    }
                }
            }
            const promises = [];
            if (fetcherTypes.length !== 0) {
                yield this.mkdirIfNecessary("fetchers");
                promises.push(this.generateFetcherTypes(fetcherTypes, inheritanceInfo));
            }
            if (inputTypes.length !== 0) {
                yield this.mkdirIfNecessary("inputs");
                promises.push(this.generateInputTypes(inputTypes));
            }
            if (enumTypes.length !== 0) {
                yield this.mkdirIfNecessary("enums");
                promises.push(this.generateEnumTypes(enumTypes));
            }
            promises.push(this.generateCommonTypes(schema, inheritanceInfo));
            this.generateServices(schema, promises);
            promises.push(this.writeIndex(schema));
            yield Promise.all(promises);
        });
    }
    createFetcheWriter(modelType, inheritanceInfo, stream, config) {
        return new FetcherWriter_1.FetcherWriter(false, modelType, inheritanceInfo, stream, config);
    }
    loadSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = yield this.config.schemaLoader();
                console.log("Load graphql graphql schema successfully");
                return schema;
            }
            catch (ex) {
                console.error("Cannot load graphql schema");
                throw ex;
            }
        });
    }
    generateFetcherTypes(fetcherTypes, inheritanceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(this.config.targetDir, "fetchers");
            const emptyFetcherNameMap = new Map();
            const defaultFetcherNameMap = new Map();
            const promises = fetcherTypes
                .map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = createStreamAndLog(path_1.join(dir, `${FetcherWriter_1.generatedFetcherTypeName(type, this.config)}.ts`));
                const writer = this.createFetcheWriter(type, inheritanceInfo, stream, this.config);
                emptyFetcherNameMap.set(type, writer.emptyFetcherName);
                if (writer.defaultFetcherName !== undefined) {
                    defaultFetcherNameMap.set(type, writer.defaultFetcherName);
                }
                writer.write();
                yield stream.end();
            }));
            yield Promise.all([
                ...promises,
                (() => __awaiter(this, void 0, void 0, function* () {
                    const stream = createStreamAndLog(path_1.join(dir, "index.ts"));
                    for (const type of fetcherTypes) {
                        const fetcherTypeName = FetcherWriter_1.generatedFetcherTypeName(type, this.config);
                        stream.write(`export type {${fetcherTypeName}} from './${fetcherTypeName}';\n`);
                        const defaultFetcherName = defaultFetcherNameMap.get(type);
                        stream.write(`export {${emptyFetcherNameMap.get(type)}${defaultFetcherName !== undefined ?
                            `, ${defaultFetcherName}` :
                            ''}} from './${fetcherTypeName}';\n`);
                    }
                    yield stream.end();
                }))()
            ]);
        });
    }
    generateInputTypes(inputTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(this.config.targetDir, "inputs");
            const promises = inputTypes.map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = createStreamAndLog(path_1.join(dir, `${type.name}.ts`));
                new InputWriter_1.InputWriter(type, stream, this.config).write();
                yield stream.end();
            }));
            yield Promise.all([
                ...promises,
                this.writeSimpleIndex(dir, inputTypes)
            ]);
        });
    }
    generateEnumTypes(enumTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(this.config.targetDir, "enums");
            const promises = enumTypes.map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = createStreamAndLog(path_1.join(dir, `${type.name}.ts`));
                new EnumWriter_1.EnumWriter(type, stream, this.config).write();
                yield stream.end();
            }));
            yield Promise.all([
                ...promises,
                this.writeSimpleIndex(dir, enumTypes)
            ]);
        });
    }
    generateCommonTypes(schema, inheritanceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = createStreamAndLog(path_1.join(this.config.targetDir, "CommonTypes.ts"));
            new CommonTypesWriter_1.CommonTypesWriter(schema, inheritanceInfo, stream, this.config).write();
            yield closeStream(stream);
        });
    }
    writeSimpleIndex(dir, types) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = createStreamAndLog(path_1.join(dir, "index.ts"));
            for (const type of types) {
                stream.write(`export type {${type.name}} from './${type.name}';\n`);
            }
            yield stream.end();
        });
    }
    rmdirIfNecessary() {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = this.config.targetDir;
            try {
                yield accessAsync(dir);
            }
            catch (ex) {
                const error = ex;
                if (error.code === "ENOENT") {
                    return;
                }
                throw ex;
            }
            console.log(`Delete directory "${dir}" and recreate it later`);
            yield rmdirAsync(dir, { recursive: true });
        });
    }
    mkdirIfNecessary(subDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = subDir !== undefined ?
                path_1.join(this.config.targetDir, subDir) :
                this.config.targetDir;
            try {
                yield accessAsync(dir);
            }
            catch (ex) {
                const error = ex;
                if (error.code === "ENOENT") {
                    console.log(`No directory "${dir}", create it`);
                    yield mkdirAsync(dir);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    writeIndex(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = createStreamAndLog(path_1.join(this.config.targetDir, "index.ts"));
            this.writeIndexCode(stream, schema);
            yield closeStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            stream.write("export type { ImplementationType } from './CommonTypes';\n");
            stream.write("export { upcastTypes, downcastTypes } from './CommonTypes';\n");
        });
    }
}
exports.Generator = Generator;
function createStreamAndLog(path) {
    console.log(`Write code into file: ${path}`);
    return fs_1.createWriteStream(path);
}
exports.createStreamAndLog = createStreamAndLog;
function closeStream(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (util_1.promisify(stream.end).call(stream));
    });
}
exports.closeStream = closeStream;
const mkdirAsync = util_1.promisify(fs_1.mkdir);
const rmdirAsync = util_1.promisify(fs_1.rmdir);
const accessAsync = util_1.promisify(fs_1.access);
