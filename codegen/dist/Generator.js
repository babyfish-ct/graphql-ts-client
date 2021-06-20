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
exports.Generator = void 0;
const graphql_1 = require("graphql");
const GeneratorConfig_1 = require("./GeneratorConfig");
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const FetcherWriter_1 = require("./FetcherWriter");
const EnumWriter_1 = require("./EnumWriter");
const InputWriter_1 = require("./InputWriter");
const OperationWriter_1 = require("./OperationWriter");
const GraphQLClientWriter_1 = require("./GraphQLClientWriter");
class Generator {
    constructor(config) {
        this.config = config;
        GeneratorConfig_1.validateConfig(config);
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = yield this.loadSchema();
            GeneratorConfig_1.validateConfigAndSchema(this.config, schema);
            if (this.config.recreateTargetDir) {
                yield this.rmdirIfNecessary();
            }
            yield this.mkdirIfNecessary();
            const queryType = schema.getQueryType();
            const mutationType = schema.getMutationType();
            const fetcherTypes = [];
            const inputTypes = [];
            const enumTypes = [];
            const typeMap = schema.getTypeMap();
            for (const typeName in typeMap) {
                if (!typeName.startsWith("__")) {
                    const type = typeMap[typeName];
                    if (type !== queryType && type !== mutationType) {
                        if (type instanceof graphql_1.GraphQLObjectType ||
                            type instanceof graphql_1.GraphQLInterfaceType) {
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
            }
            const promises = [];
            if (fetcherTypes.length !== 0) {
                yield this.mkdirIfNecessary("fetchers");
                promises.push(this.generateFetcherTypes(fetcherTypes));
            }
            if (inputTypes.length !== 0) {
                yield this.mkdirIfNecessary("inputs");
                promises.push(this.generateInputTypes(inputTypes));
            }
            if (enumTypes.length !== 0) {
                yield this.mkdirIfNecessary("enums");
                promises.push(this.generateEnumTypes(enumTypes));
            }
            const queryFields = this.objFields(queryType);
            const mutationFields = this.objFields(mutationType);
            if (this.config.generateOperations && (queryFields.length !== 0 || mutationFields.length !== 0)) {
                promises.push(this.generateGraphQLClient());
                if (queryFields.length !== 0) {
                    yield this.mkdirIfNecessary("queries");
                    promises.push(this.generateOperations(false, queryFields));
                }
                if (mutationFields.length !== 0) {
                    yield this.mkdirIfNecessary("mutations");
                    promises.push(this.generateOperations(true, mutationFields));
                }
            }
            yield Promise.all(promises);
        });
    }
    loadSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.config.schemaLoader();
                console.log("Load graphql graphql schema successfully");
            }
            catch (ex) {
                console.error("Cannot load graphql schema");
                throw ex;
            }
        });
    }
    generateFetcherTypes(fetcherTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = path_1.join(this.config.targetDir, "fetchers");
            const emptyFetcherNameMap = new Map();
            const defaultFetcherNameMap = new Map();
            const promises = fetcherTypes
                .map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = fs_1.createWriteStream(path_1.join(dir, `${FetcherWriter_1.generatedFetcherTypeName(type, this.config)}.ts`));
                const writer = new FetcherWriter_1.FetcherWriter(type, stream, this.config);
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
                    const stream = fs_1.createWriteStream(path_1.join(dir, "index.ts"));
                    for (const type of fetcherTypes) {
                        const fetcherTypeName = FetcherWriter_1.generatedFetcherTypeName(type, this.config);
                        const fetchableTypeName = FetcherWriter_1.generatedFetchableTypeName(type, this.config);
                        stream.write(`export type {${fetcherTypeName}, ${fetchableTypeName}} from './${fetcherTypeName}';\n`);
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
                const stream = fs_1.createWriteStream(path_1.join(dir, `${type.name}.ts`));
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
                const stream = fs_1.createWriteStream(path_1.join(dir, `${type.name}.ts`));
                new EnumWriter_1.EnumWriter(type, stream, this.config).write();
                yield stream.end();
            }));
            yield Promise.all([
                ...promises,
                this.writeSimpleIndex(dir, enumTypes)
            ]);
        });
    }
    generateGraphQLClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = fs_1.createWriteStream(path_1.join(this.config.targetDir, "GraphQLClient.ts"));
            new GraphQLClientWriter_1.GraphQLClientWriter(stream, this.config).write();
            yield stream.end();
        });
    }
    generateOperations(mutation, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const subDir = mutation ? "mutations" : "queries";
            const promises = fields.map((field) => __awaiter(this, void 0, void 0, function* () {
                const stream = fs_1.createWriteStream(path_1.join(this.config.targetDir, subDir, `${field.name}.ts`));
                new OperationWriter_1.OperationWriter(mutation, field, stream, this.config).write();
                yield stream.end();
            }));
            const writeIndex = () => __awaiter(this, void 0, void 0, function* () {
                const stream = fs_1.createWriteStream(path_1.join(this.config.targetDir, subDir, "index.ts"));
                for (const field of fields) {
                    stream.write(`export {${field.name}} from './${field.name}';\n`);
                    const argsWrapperName = OperationWriter_1.argsWrapperTypeName(field);
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
    writeSimpleIndex(dir, types) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = fs_1.createWriteStream(path_1.join(dir, "index.ts"));
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
    objFields(type) {
        if (type === undefined || type === null) {
            return [];
        }
        const fieldMap = type.getFields();
        const fields = [];
        for (const fieldName in fieldMap) {
            fields.push(fieldMap[fieldName]);
        }
        return fields;
    }
}
exports.Generator = Generator;
const mkdirAsync = util_1.promisify(fs_1.mkdir);
const rmdirAsync = util_1.promisify(fs_1.rmdir);
const accessAsync = util_1.promisify(fs_1.access);
