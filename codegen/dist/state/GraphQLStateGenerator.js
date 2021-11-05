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
exports.GraphQLStateGenerator = void 0;
const path_1 = require("path");
const Generator_1 = require("../Generator");
const GraphQLStateFetcherWriter_1 = require("./GraphQLStateFetcherWriter");
const TriggerEventWriter_1 = require("./TriggerEventWriter");
const TypedConfigurationWriter_1 = require("./TypedConfigurationWriter");
class GraphQLStateGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    writeIndexCode(stream, schema) {
        stream.write(`import { StateManager, makeStateFactory, makeManagedObjectHooks, useStateManager } from 'graphql-state';\n`);
        stream.write(`import type { Schema } from "./TypedConfiguration";\n`);
        stream.write(`export type { Schema } from "./TypedConfiguration";\n`);
        super.writeIndexCode(stream, schema);
        stream.write(TYPED_API);
        stream.write(`export { newTypedConfiguration} from "./TypedConfiguration";\n`);
    }
    additionalExportedTypeNamesForFetcher(modelType, ctx) {
        if (ctx.triggerableTypes.has(modelType)) {
            return [
                ...super.additionalExportedTypeNamesForFetcher(modelType, ctx),
                `${modelType.name}FlatType`
            ];
        }
        return super.additionalExportedTypeNamesForFetcher(modelType, ctx);
    }
    createFetcheWriter(modelType, ctx, stream, config) {
        return new GraphQLStateFetcherWriter_1.GraphQLStateFetcherWriter(modelType, ctx, stream, config);
    }
    generateServices(ctx, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateTypedConfiguration(ctx));
            yield this.mkdirIfNecessary("triggers");
            promises.push(this.generateTriggerEvents(ctx));
            promises.push(this.generateTriggerIndex(ctx));
        });
    }
    generateTypedConfiguration(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "TypedConfiguration.ts"));
            new TypedConfigurationWriter_1.TypedConfigurationWriter(ctx, stream, this.config).write();
            yield Generator_1.closeStream(stream);
        });
    }
    generateTriggerEvents(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const triggerableType of ctx.triggerableTypes) {
                const fetcherType = triggerableType;
                const dir = path_1.join(this.config.targetDir, "triggers");
                const stream = Generator_1.createStreamAndLog(path_1.join(dir, `${fetcherType.name}ChangeEvent.ts`));
                new TriggerEventWriter_1.TriggerEventWiter(fetcherType, ctx.idFieldMap.get(fetcherType), stream, this.config).write();
                yield Generator_1.closeStream(stream);
            }
        });
    }
    generateTriggerIndex(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(path_1.join(this.config.targetDir, "triggers"), "index.ts"));
            for (const triggerableType of ctx.triggerableTypes) {
                const fetcherType = triggerableType;
                stream.write(`export type { ${fetcherType.name}EvictEvent, ${fetcherType.name}ChangeEvent } from './${fetcherType.name}ChangeEvent';\n`);
            }
            yield Generator_1.closeStream(stream);
        });
    }
}
exports.GraphQLStateGenerator = GraphQLStateGenerator;
const TYPED_API = `
const {
    createState,
    createParameterizedState,
    createComputedState,
    createParameterizedComputedState,
    createAsyncState,
    createParameterizedAsyncState
} = makeStateFactory<Schema>();

export {
    createState,
    createParameterizedState,
    createComputedState,
    createParameterizedComputedState,
    createAsyncState,
    createParameterizedAsyncState
};

const { useObject, useObjects } = makeManagedObjectHooks<Schema>();

export { useObject, useObjects };

export function useTypedStateManager(): StateManager<Schema> {
    return useStateManager<Schema>();
}

`;
