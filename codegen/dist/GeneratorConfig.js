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
exports.validateConfigAndSchema = exports.validateConfig = void 0;
const graphql_1 = require("graphql");
const Utils_1 = require("./Utils");
function validateConfig(
/*
 * Generator can be invoked by user by javascript, not TypeScript.
 * so declare this parameter as 'any'
 */
config) {
    var _a, _b;
    if (typeof config !== "object") {
        throw new Error("The argument 'config' must be an object");
    }
    for (const key of Object.keys(config)) {
        const value = config[key];
        switch (key) {
            case 'schemaLoader':
                if (typeof value !== 'function') {
                    throw new Error('"confg.schemaLoader" must be function');
                }
                break;
            case 'targetDir':
                if (typeof value !== 'string') {
                    throw new Error('"confg.targetDir" must be string');
                }
                if (value.trim().length !== value.length) {
                    throw new Error('"confg.targetDir"  cannot start or end with whitespace');
                }
                if (value === "") {
                    throw new Error('"confg.targetDir" cannot be empty string');
                }
                break;
            case 'indent':
                if (value !== undefined) {
                    if (typeof value !== 'string') {
                        throw new Error('"confg.indent" must be undefined or string');
                    }
                    if (!INDENT_REGEXP.test(value)) {
                        throw new Error('"confg.indent" canonly contains " " and "\\t" when its specified');
                    }
                }
                break;
            case 'objectEditable':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.objectEditable" must be undefined or boolean');
                }
                break;
            case 'arrayEditable':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.arrayEditable" must be undefined or boolean');
                }
                break;
            case 'fetcherSuffix':
                if (value != undefined) {
                    if (typeof value !== 'string' || value === "") {
                        throw new Error('"confg.fetcherSuffix" must be undefined or string whose length is not zero');
                    }
                    if (!INDENT_REGEXP.test(value)) {
                        throw new Error('"confg.fetcherSuffix" canonly contains "_", "$", english letters and digits when its specified');
                    }
                }
                break;
            case 'excludedTypes':
                if (value !== undefined) {
                    if (!Array.isArray(value)) {
                        throw new Error('"confg.excludedTypes" must be undefined or array');
                    }
                    for (let i = 0; i < value.length; i++) {
                        if (typeof (value[i]) !== 'string') {
                            throw new Error(`"confg.excludedTypes[${i}]" must be string`);
                        }
                    }
                }
                break;
            case 'scalarTypeMap':
                if (value !== undefined) {
                    if (typeof value !== 'object') {
                        throw new Error('"confg.scalarTypeMap" must be undefined or object');
                    }
                    for (const scalarTypeName in value) {
                        const mappedType = value[scalarTypeName];
                        if (typeof mappedType === 'object') {
                            if (typeof mappedType.typeName !== 'string' || typeof mappedType.importSource !== 'string') {
                                throw new Error(`"confg.scalarTypeMap[${scalarTypeName}]" must have two string fields: 'typeName' and 'importSource'`);
                            }
                        }
                        else if (typeof mappedType !== 'string') {
                            throw new Error(`"confg.scalarTypeMap[${scalarTypeName}]" must be string or object`);
                        }
                    }
                }
                break;
            case 'idFieldMap':
                if (value !== undefined && typeof value !== 'object') {
                    throw new Error('"confg.idFieldMap" must be undefined or object');
                }
                break;
            case 'defaultFetcherExcludeMap':
                if (value !== undefined && typeof value !== 'object') {
                    throw new Error('"confg.defaultFetcherExcludeMap" must be undefined or object');
                }
                break;
            case 'tsEnum':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.tsEnum" must be undefined or boolean');
                }
                break;
            case 'recreateTargetDir':
            case 'excludedOperations':
            case 'excludedTypes':
                console.warn(`"confg.${key}" is deprecated`);
                break;
            default:
                throw new Error(`unsupported configuration property: ${key}`);
        }
    }
    if (config.schemaLoader === undefined) {
        throw new Error('config.schemaLoader is required');
    }
    if (config.targetDir === undefined) {
        throw new Error('config.targetDir is required');
    }
    const fetcherSuffiex = (_a = config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher";
    const fetchableSuffix = (_b = config.fetchableSuffix) !== null && _b !== void 0 ? _b : "Fetchable";
    if (fetcherSuffiex === fetchableSuffix) {
        throw new Error('config.fetcherSuffiex and config.fetchableSuffix are conflict');
    }
}
exports.validateConfig = validateConfig;
function validateConfigAndSchema(config, schema) {
    const typeMap = schema.getTypeMap();
    for (const typeName in typeMap) {
        const type = typeMap[typeName];
        if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
            const fieldMap = type.getFields();
            for (const fieldName in fieldMap) {
                const field = fieldMap[fieldName];
                if (BUILT_IN_FEILDS.has(field.name)) {
                    throw new Error(`Illegal field '${field.name}' of type '${type.name}', ` +
                        "it's name is protected by 'graphql-ts-client-api', please change the server-side app");
                }
            }
        }
    }
    const idFieldMap = config.idFieldMap;
    if (idFieldMap !== undefined) {
        for (const typeName in idFieldMap) {
            const type = typeMap[typeName];
            if (!(type instanceof graphql_1.GraphQLObjectType) && !(type instanceof graphql_1.GraphQLInterfaceType)) {
                throw new Error(`config.idFieldMap contains an illegal key '${typeName}', ` +
                    "that is neither a graphql object type nor graphql interface type");
            }
            const fieldMap = type.getFields();
            const idField = fieldMap[idFieldMap[typeName]];
            if (idField === undefined) {
                throw new Error(`config.idFieldMap['${typeName}'] is illegal, ` +
                    `there is not field named '${idFieldMap[typeName]}' in the type '${typeName}'`);
            }
            if ((0, Utils_1.targetTypeOf)(idField.type) !== undefined) {
                throw new Error(`config.idFieldMap['${typeName}'] is illegal, ` +
                    `the field '${idFieldMap[typeName]}' of the type '${typeName}' is not scalar`);
            }
        }
    }
    const excludeMap = config.defaultFetcherExcludeMap;
    if (excludeMap !== undefined) {
        for (const typeName in excludeMap) {
            const type = typeMap[typeName];
            if (!(type instanceof graphql_1.GraphQLObjectType) && !(type instanceof graphql_1.GraphQLInterfaceType)) {
                throw new Error(`config.defaultFetcherExcludeMap contains an illegal key '${typeName}' ` +
                    "that is neither a graphql object type nor graphql interface type");
            }
            const fieldMap = type.getFields();
            const fieldNames = excludeMap[typeName];
            if (!Array.isArray(fieldNames)) {
                throw new Error(`config.defaultFetcherExcludeMap['${typeName}'] is not array`);
            }
            for (let i = fieldNames.length - 1; i >= 0; i--) {
                const fieldName = fieldNames[i];
                if (typeof fieldName !== 'string') {
                    throw new Error(`config.defaultFetcherExcludeMap['${typeName}'][${i}] is not string`);
                }
                if (fieldMap[fieldName] === undefined) {
                    throw new Error(`config.defaultFetcherExcludeMap['${typeName}'][${i}] is illegal, ` +
                        `its value '${fieldName}' is not a field of graphql type '${typeName}'`);
                }
            }
        }
    }
}
exports.validateConfigAndSchema = validateConfigAndSchema;
const INDENT_REGEXP = /^( |\t)+$/;
const BUILT_IN_FEILDS = new Set([
    "fetchedEntityType",
    "_prev",
    "_negative",
    "_field",
    "_args",
    "_child",
    "constructor",
    "addField",
    "removeField",
    "toString",
    "_toString0",
    "_str",
    "toJSON",
    "_toJSON0",
    "_json",
    "fieldMap",
    "_getFieldMap0",
    "__supressWarnings__"
]);
