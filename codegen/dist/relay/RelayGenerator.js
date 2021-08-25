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
exports.RelayGenerator = void 0;
const path_1 = require("path");
const FetcherWriter_1 = require("../FetcherWriter");
const Generator_1 = require("../Generator");
const RelayHookWriter_1 = require("./RelayHookWriter");
class RelayGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    createFetcheWriter(modelType, inheritanceInfo, stream, config) {
        return new FetcherWriter_1.FetcherWriter(true, modelType, inheritanceInfo, stream, config);
    }
    generateServices(queryFields, mutationFields, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryFields.length !== 0) {
                promises.push(this.generateQueries(queryFields));
            }
            if (mutationFields.length !== 0) {
                promises.push(this.generateMutations(mutationFields));
            }
            promises.push(this.generateRelayFragment());
        });
    }
    generateQueries(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Queries.ts"));
            new RelayHookWriter_1.RelayHookWriter("Query", fields, stream, this.config).write();
            Generator_1.awaitStream(stream);
        });
    }
    generateMutations(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Mutations.ts"));
            new RelayHookWriter_1.RelayHookWriter("Mutation", fields, stream, this.config).write();
            yield Generator_1.awaitStream(stream);
        });
    }
    generateRelayFragment() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "TaggedNode.tsx"));
            stream.write(RELAY_FRAGMENT_CODE);
            yield Generator_1.awaitStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            stream.write("export { RelayQuery, RelayMutation, RelayFragment, createFragment } from './TaggedNode';\n");
            stream.write("export type { FragmentKey } from './TaggedNode';\n");
            if (Object.keys((_b = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields()) !== null && _b !== void 0 ? _b : {}).length !== 0) {
                stream.write("export { createQuery } from './Queries';\n");
            }
            if (Object.keys((_d = (_c = schema.getMutationType()) === null || _c === void 0 ? void 0 : _c.getFields()) !== null && _d !== void 0 ? _d : {}).length !== 0) {
                stream.write("export { createMutation } from './Mutations';\n");
            }
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const RELAY_FRAGMENT_CODE = `
import type { Fetcher, FetcherField } from "graphql-ts-client-api";
import { FragmentWrapper, TextWriter, util } from "graphql-ts-client-api";
import { 
    GraphQLTaggedNode,
    ConcreteRequest, 
    NormalizationLocalArgumentDefinition, 
    NormalizationOperation, 
    NormalizationSelection, 
    ReaderArgument, 
    ReaderArgumentDefinition, 
    ReaderFragment, 
    ReaderSelection, 
    RequestParameters 
} from "relay-runtime";

export abstract class RelayOperation<TResponse, TVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        operationType: "query" | "mutation",
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        if (RELAY_OPERATION_MAP.has(operationName)) {
            throw new Error(
                \`The relay operation '\${operationName}' is aleary exists, please make sure: \` + 
                "1. Each relay operation is created and saved as constant under GLOBAL scope, " +
                "2. Each relay operation has a unique name"
            );
        }
        this.taggedNode = buildOperation(
            operationType,
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
        RELAY_OPERATION_MAP.set(operationName, this);
    }

    __supressWarnings(vaiables: TVariables, response: TResponse) {
        throw new Error("Unspported function __supressWarnings");
    }
}

/*
 * Example:
 *
 * import { DEPARTMENT_FRAGMENT } form '...';
 * 
 * export const DEPARTMENT_LIST_QUERY =
 *     createQuery(
 *         "DepartmentListQuery",
 *         "findDepartmentsLikeName",
 *         department$
 *         .on(DEPARTMENT_FRAGMENT)         
 *     );
 */
export class RelayQuery<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        super(
            "query",
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
    }
}

/*
 * Example:
 *
 * import { DEPARTMENT_FRAGMENT } form '...';
 * 
 * export const DEPARTMENT_MUTATION =
 *     createMutation(
 *         "DepartmentMutation",
 *         "mergeDepartment",
 *         department$$           
 *     );
 */
export class RelayMutation<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        super(
            "mutation",
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
    }
}

/*
 * Example:
 * 
 * export const DEPARTMENT_FRAGMENT =
 *     createFragment(
 *         "DepartmentFragment",
 *         department$$
 *         .employees(
 *             employee$$
 *         )           
 *     );
 */
export class RelayFragment<TFragmentName extends string, E extends string, T extends object, TUnresolvedVariables extends object> 
extends FragmentWrapper<TFragmentName, E, T, TUnresolvedVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<E, T, TUnresolvedVariables>
    ) {
        super(name, fetcher);
        if (RELAY_FRAGMENT_MAP.has(name)) {
            throw new Error(
                \`The relay fragment '\${name} is aleary exists, please make sure: \` +
                "1. Each relay fragment is created and saved as constant under GLOBAL scope " +
                "2. Each relay fragment has a unique name"
            );
        }
        this.taggedNode = buildFragment(name, fetcher);
        RELAY_FRAGMENT_MAP.set(name, this);
    }
}

export function createFragment<
    TFragmentName extends string, 
    E extends string, 
    T extends object, 
    TUnresolvedVariables extends object
>(
    name: TFragmentName, 
    fetcher: Fetcher<E, T, TUnresolvedVariables>
): RelayFragment<TFragmentName, E, T, TUnresolvedVariables> {
    return new RelayFragment<TFragmentName, E, T, TUnresolvedVariables>(name, fetcher);
}

export type FragmentKey<T> =
    T extends RelayFragment<infer TFragmentName, string, infer TData, object> ? 
    { readonly " $data": TData, readonly " $fragmentRefs": TFragmentName } :
    never
;

const RELAY_OPERATION_MAP = new Map<string, RelayOperation<any, any>>();

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object, object>>();



////////////////////////////////////////////////////



function buildOperation(
    operationType: "query" | "mutation",
    operationName: string,
    operationField: string,
    operationAlias: string | undefined,
    operationVariableMap: { [key: string]: string },
    plural: boolean,
    fetcher?: Fetcher<string, object, object>
): ConcreteRequest {
    const variableMap = new Map<string, string>();
    for (const variableName in operationVariableMap) {
        variableMap.set(variableName, operationVariableMap[variableName]);
    }
    if (fetcher !== undefined) {
        for (const [name, type] of fetcher.explicitVariableMap) {
            if (variableMap.has(name) && variableMap.get(name) !== type) {
                throw new Error(\`Conflict types '\${variableMap.get(name)}' and '\${type}' for variable '\${name}'\`);
            }
            variableMap.set(name, type);
        }
        for (const [name, type] of fetcher.implicitVariableMap) {
            if (variableMap.has(name) && variableMap.get(name) !== type) {
                throw new Error(\`Conflict types '\${variableMap.get(name)}' and '\${type}' for variable '\${name}'\`);
            }
            variableMap.set(name, type);
        }
    }
    const argumentDefinitions: ReaderArgumentDefinition[] = [];
    for (const [name, ] of variableMap) {
        argumentDefinitions.push({
            kind: "LocalArgument",
            name
        });
    }

    const args: ReaderArgument[] = [];
    for (const [name, ] of variableMap) {
        args.push({
            kind: "Variable",
            name: name,
            variableName: name
        });
    }

    const selections: ReaderSelection[] = [{
        concreteType: fetcher?.fetchableType?.entityName,
        kind: fetcher !== undefined ? "LinkedField" : "ScalarField",
        name: operationField,
        plural,
        args, 
        alias: operationAlias,
        selections: fetcher !== undefined ? buildSelections(fetcher) : []
    }];

    const fragment: ReaderFragment = {
        kind: "Fragment",
        metadata: null,
        name: operationName,
        argumentDefinitions,
        type: "Query",
        selections
    };

    const operation: NormalizationOperation = {
        kind: "Operation",
        name: operationName,
        argumentDefinitions: argumentDefinitions as NormalizationLocalArgumentDefinition[],
        selections: selections as NormalizationSelection[]
    }

    const writer = new TextWriter();
    writer.text(\`\${operationType} \${operationName}\`);
    if (variableMap.size !== 0) {
        writer.scope({type: "ARGUMENTS", multiLines: variableMap.size > 2, suffix: " "}, () => {
            for (const [name, type] of variableMap) {
                writer.seperator();
                writer.text(\`$\${name}: \${type}\`);
            }
        });
    }
    writer.scope({type: "BLOCK", multiLines: true, suffix: "\\n"}, () => {
        if (operationAlias !== undefined && operationAlias !== operationField) {
            writer.text(\`\${operationAlias}: \`);
        }
        writer.text(operationField);
        if (variableMap.size !== 0) {
            writer.scope({type: "ARGUMENTS", multiLines: variableMap.size > 2, suffix: " "}, () => {
                for (const [name, ] of variableMap) {
                    writer.seperator();
                    writer.text(\`\${name}: $\${name}\`);
                }
            });
        }
        if (fetcher !== undefined) {
            writer.text(fetcher.toString());
        }
    });
    if (fetcher !== undefined) {
        writer.text(fetcher.toFragmentString());
    }
    const text = writer.toString();

    const params: RequestParameters = {
        id: null,
        cacheID: util.toMd5(text),
        name: operationName,
        operationKind: operationType,
        metadata: {},
        text
    };

    return {
        kind: "Operation",
        fragment,
        operation,
        params
    }
}

function buildFragment(name: string, fetcher: Fetcher<string, object, object>): ReaderFragment {

    return {
        kind: "Fragment",
        name,
        metadata: {},
        type: fetcher.fetchableType.entityName,
        argumentDefinitions: [],
        selections: buildSelections(fetcher)
    };
}

function buildSelections(fetcher: Fetcher<string, object, object>): ReaderSelection[] {
    const selections: ReaderSelection[] = [];
    collectFetcherSelections(fetcher, selections);
    return selections;
}

function collectFetcherSelections(fetcher: Fetcher<string, object, object>, output: ReaderSelection[]) {
    for (const [fieldName, field] of fetcher.fieldMap) {
        collectFieldSelections(fieldName, field, output);
    }
}

function collectFieldSelections(fieldName: string, field: FetcherField, output: ReaderSelection[]) {

    if (field.childFetchers !== undefined) {
        if (fieldName === '...') {
            for (const childFetcher of field.childFetchers) {
                collectFetcherSelections(childFetcher, output);
            }
        } if (fieldName.startsWith("...") && !fieldName.startsWith("... on ")) {
            const fragmentName = fieldName.substring(4).trim();
            output.push({
                kind: "FragmentSpread",
                name: fragmentName,
                args: null
            });
        } else {
            const childSelections: ReaderSelection[] = [];
            for (const childFetcher of field.childFetchers) {
                collectFetcherSelections(childFetcher, childSelections);
            }
            if (fieldName.startsWith("...")) {
                const typeName = fieldName.substring(7).trim();
                output.push({
                    kind: "InlineFragment",
                    type: typeName,
                    selections: childSelections
                });
            } else {
                output.push({
                    kind: "LinkedField",
                    alias: undefined,
                    name: fieldName,
                    storageKey: undefined,
                    args: null,
                    concreteType: field.childFetchers[0].fetchableType.entityName,
                    plural: field.plural,
                    selections: childSelections
                });
            }
        }
    } else {
        output.push({
            kind: "ScalarField",
            alias: undefined,
            name: fieldName,
            args: undefined,
            storageKey: undefined
        });
    }
}
`;
