/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from "graphql";

export interface GeneratorConfig {
    readonly schemaLoader: () => Promise<GraphQLSchema>,
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly indent?: string;
    readonly objectEditable?: boolean;
    readonly arrayEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly fetchableSuffix?: string;
    readonly generateOperations?: boolean;
    readonly defaultFetcherExcludeMap?: {[key: string]: string[]}
}

export function validateConfig(
    /*
     * Generator can be invoked by user by javascript, not TypeScript.
     * so declare this parameter as 'any'
     */
    config: any
) {
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
            case 'fetchableSuffix':
                if (value != undefined) {
                    if (typeof value !== 'string' || value === "") {
                        throw new Error('"confg.fetchableSuffix" must be undefined or string whose length is not zero');
                    }
                    if (!INDENT_REGEXP.test(value)) {
                        throw new Error('"confg.fetchableSuffix" canonly contains "_", "$", english letters and digits when its specified');
                    }
                }
                break;
            case 'generateOperations':
                if (value !== undefined && typeof value !== 'boolean') {
                    throw new Error('"confg.generateOperations" must be undefined or boolean');
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
    const fetcherSuffiex = config.fetcherSuffix ?? "Fetcher";
    const fetchableSuffix = config.fetchableSuffix ?? "Fetchable";
    if (fetcherSuffiex === fetchableSuffix) {
        throw new Error('config.fetcherSuffiex and config.fetchableSuffix are conflict');
    }
}

export function validateConfigAndSchema(
    config: GeneratorConfig,
    schema: GraphQLSchema
) {
    const typeMap = schema.getTypeMap();
    for (const typeName in typeMap) {
        const type = typeMap[typeName]!;
        if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
            const fieldMap = type.getFields();
            for (const fieldName in fieldMap) {
                const field = fieldMap[fieldName]!;
                if (BUILT_IN_FEILDS.has(field.name)) {
                    throw new Error(
                        `Illegal field '${field.name}' of type '${type.name}', ` +
                        "it's name is protected by 'graphql-ts-client-api', please change the server-side app"
                    );
                }
            }
        }
    }
    const excludeMap = config.defaultFetcherExcludeMap;
    if (excludeMap !== undefined) {
        for (const typeName in excludeMap) {
            const type = typeMap[typeName];
            if (!(type instanceof GraphQLObjectType) && !(type instanceof GraphQLInterfaceType)) {
                throw new Error(
                    `config.defaultFetcherExcludeMap contains an illegal key '${typeName}' ` +
                    "that is neither a graphql object type nor graphql interface type"
                );
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
                    throw new Error(
                        `config.defaultFetcherExcludeMap['${typeName}'][${i}] is illegal, ` +
                        `its value '${fieldName}' is not a field of graphql type '${typeName}'`
                    );
                }
            }
        }
    }
}

const INDENT_REGEXP = /^( |\t)+$/;
const FETCHER_SUFFIX_REGEXP = /^[A-Za-z0-9_\$]$/;
const BUILT_IN_FEILDS = new Set<string>([
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
    "_getFieldMap",
    "__supressWarnings__"
]);