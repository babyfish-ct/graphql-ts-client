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
const Generator_1 = require("../Generator");
const RelayFetcherWriter_1 = require("./RelayFetcherWriter");
const RelayWriter_1 = require("./RelayWriter");
class RelayGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    createFetcheWriter(modelType, ctx, stream, config) {
        return new RelayFetcherWriter_1.RelayFetcherWriter(modelType, ctx, stream, config);
    }
    generateServices(ctx, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateRelayCode(ctx.schema));
        });
    }
    generateRelayCode(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Relay.ts"));
            new RelayWriter_1.RelayWriter(schema, stream, this.config).write();
            yield Generator_1.closeStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        return __awaiter(this, void 0, void 0, function* () {
            stream.write(EXPORT_RELAY_TYPES_CODE);
            stream.write(EXPORT_RELAY_CODE);
            yield _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryOf, 
    OperationOf, 
    OperationResponseOf, 
    OperationVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    OperationType,
    FragmentKeyType
} from "./Relay";
`;
const EXPORT_RELAY_CODE = `export {
    createTypedQuery,
    createTypedMutation,
    createTypedFragment,
    loadTypedQuery,
    fetchTypedQuery,
    useTypedQueryLoader,
    useTypedPreloadedQuery,
    useTypedLazyLoadQuery,
    useTypedMutation,
    useTypedFragment,
    useTypedRefetchableFragment,
    useTypedPaginationFragment,
    getConnection,
    getConnectionID
} from './Relay';
`;
