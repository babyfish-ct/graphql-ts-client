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
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "RelayFragment.tsx"));
            stream.write(RELAY_FRAGMENT_CODE);
            yield Generator_1.awaitStream(stream);
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const RELAY_FRAGMENT_CODE = `
import { Fetcher, FragmentWrapper } from "graphql-ts-client-api";
import { GraphQLTaggedNode, graphql } from "relay-runtime";

/*
 * Example:
 *
 * export const DEPARTMENT_FRAGMENT =
 *     department$
 *     .id
 *     .name
 *     .employees(
 *         employee$
 *         .id
 *         .firstName
 *         .lastName
 *     )
 *     .toRelayFragment("DepartmentItem_item");
 */

export class RelayFragment<TFragmentName extends string, E extends string, T extends object> extends FragmentWrapper<TFragmentName, E, T>  {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<E, object>
    ) {
        super(name, fetcher);
        if (RELAY_FRAGMENT_MAP.has(name)) {
            throw new Error(
                \`The relay fragment '\${name} is aleary exists, please make sure: 
                "1. Each relay fragment is declared as constant under GLOBAL scope
                "2. Each relay fragment has a unique name\`
            );
        }
        const relayFragment = new RelayFragment<TFragmentName, E, T>(name, fetcher);
        RELAY_FRAGMENT_MAP.set(name, relayFragment);
        this.taggedNode = graphql(\`fragment \${name} \${fetcher.toString()}\`);
    }
}

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object>>();`;
