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
        this.config = config;
        (0, GeneratorConfig_1.validateConfig)(config);
    }
    generate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const schema = yield this.loadSchema();
            (0, GeneratorConfig_1.validateConfigAndSchema)(this.config, schema);
            yield this.rmdirIfNecessary();
            yield this.mkdirIfNecessary();
            const inheritanceInfo = new InheritanceInfo_1.InheritanceInfo(schema);
            const fetcherTypes = [];
            const connections = new Map();
            const edgeTypes = new Set();
            const inputTypes = [];
            const enumTypes = [];
            const typeMap = schema.getTypeMap();
            for (const typeName in typeMap) {
                if (!typeName.startsWith("__")) {
                    const type = typeMap[typeName];
                    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
                        const tuple = connectionTypeTuple(type);
                        if (tuple !== undefined) {
                            connections.set(tuple[0], {
                                edgeType: tuple[1],
                                nodeType: tuple[2]
                            });
                            edgeTypes.add(tuple[1]);
                        }
                    }
                    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType || type instanceof graphql_1.GraphQLUnionType) {
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
            const configuredIdFieldMap = (_a = this.config.idFieldMap) !== null && _a !== void 0 ? _a : {};
            const entityTypes = new Set();
            const embeddedTypes = new Set();
            const idFieldMap = new Map();
            const triggerableTypes = new Set();
            const typesWithParameterizedField = new Set();
            for (const fetcherType of fetcherTypes) {
                if (connections.has(fetcherType) || edgeTypes.has(fetcherType)) {
                    continue;
                }
                if (fetcherType instanceof graphql_1.GraphQLObjectType || fetcherType instanceof graphql_1.GraphQLInterfaceType) {
                    const fieldMap = fetcherType.getFields();
                    if (fetcherType.name === "Query") {
                        if (Object.keys(fieldMap).length !== 0) {
                            triggerableTypes.add(fetcherType);
                        }
                    }
                    else {
                        let idFieldName = configuredIdFieldMap[fetcherType.name];
                        if (idFieldName === undefined) {
                            let configuredUpcastType = undefined;
                            inheritanceInfo.visitUpcastTypesRecursively(fetcherType, upcastType => {
                                const newIdFieldName = configuredIdFieldMap[upcastType.name];
                                if (idFieldName === undefined) {
                                    configuredUpcastType = upcastType;
                                    idFieldName = newIdFieldName;
                                }
                                else if (idFieldName !== newIdFieldName) {
                                    throw new Error(`Conflict id property configuration: ${configuredUpcastType.name}.${idFieldName} and ${fetcherType.name}.${newIdFieldName}`);
                                }
                            });
                        }
                        const idField = fieldMap[idFieldName !== null && idFieldName !== void 0 ? idFieldName : "id"];
                        if (idField !== undefined && idField !== null) {
                            idFieldMap.set(fetcherType, idField);
                            entityTypes.add(fetcherType);
                            if (Object.keys(fieldMap).length !== 1) {
                                triggerableTypes.add(fetcherType);
                            }
                        }
                        else {
                            embeddedTypes.add(fetcherType);
                        }
                    }
                    for (const fieldName in fieldMap) {
                        const args = fieldMap[fieldName].args;
                        if (args.length !== 0) {
                            typesWithParameterizedField.add(fetcherType);
                            break;
                        }
                    }
                }
            }
            const ctx = {
                schema,
                inheritanceInfo,
                fetcherTypes,
                entityTypes,
                embeddedTypes,
                connections,
                edgeTypes,
                triggerableTypes,
                idFieldMap,
                typesWithParameterizedField
            };
            const promises = [];
            if (fetcherTypes.length !== 0) {
                yield this.mkdirIfNecessary("fetchers");
                promises.push(this.generateFetcherTypes(ctx));
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
            this.generateServices(ctx, promises);
            promises.push(this.writeIndex(schema));
            yield Promise.all(promises);
        });
    }
    createFetcheWriter(modelType, ctx, stream, config) {
        return new FetcherWriter_1.FetcherWriter(modelType, ctx, stream, config);
    }
    additionalExportedTypeNamesForFetcher(modelType, ctx) {
        return [];
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
    generateFetcherTypes(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = (0, path_1.join)(this.config.targetDir, "fetchers");
            const emptyFetcherNameMap = new Map();
            const defaultFetcherNameMap = new Map();
            const promises = ctx.fetcherTypes
                .map((type) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const stream = createStreamAndLog((0, path_1.join)(dir, `${type.name}${(_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.fetcherSuffix) !== null && _b !== void 0 ? _b : "Fetcher"}.ts`));
                const writer = this.createFetcheWriter(type, ctx, stream, this.config);
                emptyFetcherNameMap.set(type, writer.emptyFetcherName);
                if (writer.defaultFetcherName !== undefined) {
                    defaultFetcherNameMap.set(type, writer.defaultFetcherName);
                }
                writer.write();
                yield closeStream(stream);
            }));
            yield Promise.all([
                ...promises,
                (() => __awaiter(this, void 0, void 0, function* () {
                    var _c, _d;
                    const stream = createStreamAndLog((0, path_1.join)(dir, "index.ts"));
                    for (const type of ctx.fetcherTypes) {
                        const fetcherTypeName = `${type.name}${(_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.fetcherSuffix) !== null && _d !== void 0 ? _d : "Fetcher"}`;
                        stream.write(`export type {${[
                            fetcherTypeName,
                            (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) &&
                                ctx.typesWithParameterizedField.has(type) ?
                                `${type.name}Args` :
                                undefined,
                            ...this.additionalExportedTypeNamesForFetcher(type, ctx)
                        ]
                            .filter(text => text !== undefined)
                            .join(", ")}} from './${fetcherTypeName}';\n`);
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
            const dir = (0, path_1.join)(this.config.targetDir, "inputs");
            const promises = inputTypes.map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = createStreamAndLog((0, path_1.join)(dir, `${type.name}.ts`));
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
            const dir = (0, path_1.join)(this.config.targetDir, "enums");
            const promises = enumTypes.map((type) => __awaiter(this, void 0, void 0, function* () {
                const stream = createStreamAndLog((0, path_1.join)(dir, `${type.name}.ts`));
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
            const stream = createStreamAndLog((0, path_1.join)(this.config.targetDir, "CommonTypes.ts"));
            new CommonTypesWriter_1.CommonTypesWriter(schema, inheritanceInfo, stream, this.config).write();
            yield closeStream(stream);
        });
    }
    writeSimpleIndex(dir, types) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = createStreamAndLog((0, path_1.join)(dir, "index.ts"));
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
                (0, path_1.join)(this.config.targetDir, subDir) :
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
            const stream = createStreamAndLog((0, path_1.join)(this.config.targetDir, "index.ts"));
            this.writeIndexCode(stream, schema);
            yield closeStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        stream.write("export type { ImplementationType } from './CommonTypes';\n");
        stream.write("export { upcastTypes, downcastTypes } from './CommonTypes';\n");
    }
}
exports.Generator = Generator;
function createStreamAndLog(path) {
    console.log(`Write code into file: ${path}`);
    return (0, fs_1.createWriteStream)(path);
}
exports.createStreamAndLog = createStreamAndLog;
function closeStream(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ((0, util_1.promisify)(stream.end).call(stream));
    });
}
exports.closeStream = closeStream;
function connectionTypeTuple(type) {
    const edges = type.getFields()["edges"];
    if (edges !== undefined) {
        const listType = edges.type instanceof graphql_1.GraphQLNonNull ?
            edges.type.ofType :
            edges.type;
        if (listType instanceof graphql_1.GraphQLList) {
            const edgeType = listType.ofType instanceof graphql_1.GraphQLNonNull ?
                listType.ofType.ofType :
                listType.ofType;
            if (edgeType instanceof graphql_1.GraphQLObjectType) {
                const node = edgeType.getFields()["node"];
                if (node !== undefined) {
                    if (!(edges.type instanceof graphql_1.GraphQLNonNull)) {
                        waring(`The type "${type.name}" is connection, its field "edges" must be not-null list`);
                    }
                    if (!(listType.ofType instanceof graphql_1.GraphQLNonNull)) {
                        waring(`The type "${type.name}" is connection, element of  its field "edges" must be not-null`);
                    }
                    let nodeType;
                    if (node.type instanceof graphql_1.GraphQLNonNull) {
                        nodeType = node.type.ofType;
                    }
                    else {
                        waring(`The type "${edgeType}" is edge, its field "node" must be non-null`);
                        nodeType = node.type;
                    }
                    if (!(nodeType instanceof graphql_1.GraphQLObjectType) && !(nodeType instanceof graphql_1.GraphQLInterfaceType) && !(nodeType instanceof graphql_1.GraphQLUnionType)) {
                        throw new Error(`The type "${edgeType}" is edge, its field "node" must be object, interface, union or their non-null wrappers`);
                    }
                    const cursor = edgeType.getFields()["cursor"];
                    if (cursor === undefined) {
                        waring(`The type "${edgeType}" is edge, it must defined a field named "cursor"`);
                    }
                    else {
                        const cursorType = cursor.type instanceof graphql_1.GraphQLNonNull ?
                            cursor.type.ofType :
                            cursor.type;
                        if (cursorType !== graphql_1.GraphQLString) {
                            throw new Error(`The type "${edgeType}" is edge, its field "cursor" must be string`);
                        }
                    }
                    return [type, edgeType, nodeType];
                }
            }
        }
    }
    return undefined;
}
function waring(message) {
    console.warn("******** GraphQL code generator warning! ********");
    console.log(message);
    console.warn("*************************************************");
    console.log("");
}
const mkdirAsync = (0, util_1.promisify)(fs_1.mkdir);
const rmdirAsync = (0, util_1.promisify)(fs_1.rmdir);
const accessAsync = (0, util_1.promisify)(fs_1.access);
