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
            case 'recreateTargetDir':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.recreateTargetDir" must be undefined or boolean');
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
            case 'generateOperations':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.generateOperations" must be undefined or boolean');
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
            case 'excludedOperations':
                if (value !== undefined) {
                    if (!Array.isArray(value)) {
                        throw new Error('"confg.excludedOperations" must be undefined or array');
                    }
                    for (let i = 0; i < value.length; i++) {
                        if (typeof (value[i]) !== 'string') {
                            throw new Error(`"confg.excludedOperations[${i}]" must be string`);
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
                        if (typeof mappedType !== 'string') {
                            throw new Error(`"confg.scalarTypeMap[${scalarTypeName}]" must be string`);
                        }
                        if (mappedType !== 'string' && mappedType !== 'number' && mappedType !== 'boolean') {
                            throw new Error(`"confg.scalarTypeMap[${scalarTypeName}]" is illegal value '${mappedType}', its value must be 'string' | 'number' | 'boolean'`);
                        }
                    }
                }
                break;
            case 'defaultFetcherExcludeMap':
                if (value !== undefined && typeof value !== 'object') {
                    throw new Error('"confg.defaultFetcherExcludeMap" must be undefined or object');
                }
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
    var _a, _b, _c, _d;
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
    const excludedTypes = config.excludedTypes;
    if (excludedTypes !== undefined) {
        for (let i = 0; i < excludedTypes.length; i++) {
            const type = typeMap[excludedTypes[i]];
            if (type === undefined) {
                throw new Error(`config.excludedTypes[${i}] has an illlegal value '${excludedTypes[i]}' ` +
                    "that is not a valid graphql type name");
            }
        }
    }
    const excludedOperations = config.excludedOperations;
    if (excludedOperations !== undefined) {
        const queryFields = (_b = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields()) !== null && _b !== void 0 ? _b : {};
        const mutationFields = (_d = (_c = schema.getMutationType()) === null || _c === void 0 ? void 0 : _c.getFields()) !== null && _d !== void 0 ? _d : {};
        for (let i = 0; i < excludedOperations.length; i++) {
            const operation = excludedOperations[i];
            let matched = false;
            for (const name in queryFields) {
                if (operation === name) {
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                for (const name in mutationFields) {
                    if (operation === name) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    throw new Error(`config.excludedTypes[${i}] has an illegal value '${excludedTypes[i]}' ` +
                        "that is not a valid field name graphql query/mutation");
                }
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
