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
const RelayWriter_1 = require("./RelayWriter");
class RelayGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    createFetcheWriter(modelType, inheritanceInfo, stream, config) {
        return new FetcherWriter_1.FetcherWriter(true, modelType, inheritanceInfo, stream, config);
    }
    generateServices(schema, promises) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const queryFieldMap = (_b = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields()) !== null && _b !== void 0 ? _b : {};
            const queryFields = [];
            for (const fieldName in queryFieldMap) {
                const queryField = queryFieldMap[fieldName];
                queryFields.push(queryField);
            }
            promises.push(this.generateRelayCode(queryFields));
        });
    }
    generateRelayCode(queryFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Relay.ts"));
            new RelayWriter_1.RelayWriter(queryFields, stream, this.config).write();
            yield Generator_1.awaitStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        return __awaiter(this, void 0, void 0, function* () {
            stream.write(EXPORT_RELAY_TYPES_CODE);
            stream.write(EXPORT_RELAY_VARS_CODE);
            yield _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryOf, 
    OperationOf, 
    QueryResponseOf, 
    QueryVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    OperationType,
    FragmentKeyType
} from "./Relay";\n`;
const EXPORT_RELAY_VARS_CODE = `export {
    RelayQuery, 
    RelayMutation, 
    RelayFragment, 
    createTypedQuery,
    createTypedMutation,
    createTypedFragment,
    createTypedOperationDescriptor,
    loadTypedQuery,
    useTypedQueryLoader,
    useTypedPreloadedQuery,
    useTypedLazyLoadQuery,
    useTypedMutation,
    useTypedFragment,
    useTypedRefetchableFragment
} from "./Relay";\n`;
