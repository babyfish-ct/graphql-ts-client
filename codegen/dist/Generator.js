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
const fs_1 = require("fs");
const util_1 = require("util");
const TypeGenerator_1 = require("./TypeGenerator");
class Generator {
    constructor(config) {
        this.config = config;
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = yield this.parseSchema();
            yield this.recreateTargetDir();
            const queryType = schema.getQueryType();
            const mutationType = schema.getMutationType();
            const typeMap = schema.getTypeMap();
            for (const typeName in typeMap) {
                if (!typeName.startsWith("__")) {
                    const type = typeMap[typeName];
                    if (type !== queryType && type !== mutationType) {
                        TypeGenerator_1.generateType(type, this.config);
                    }
                }
            }
        });
    }
    parseSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            let schemaDefinition;
            try {
                schemaDefinition = yield this.config.schemaExtractor();
                console.log("Get graphql graphql schema definition successfully");
                console.log(schemaDefinition);
            }
            catch (ex) {
                console.error("Cannot get graphql schema definition");
                throw ex;
            }
            try {
                return graphql_1.buildSchema(schemaDefinition);
            }
            catch (ex) {
                console.error("Failed to parse graphql schema");
                throw ex;
            }
        });
    }
    recreateTargetDir() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.config.targetDir);
            if (this.config.recreateTargetDir && (yield existsAsync(this.config.targetDir))) {
                try {
                    rmdirAsync(this.config.targetDir);
                }
                catch (ex) {
                    console.error(`'recreateTargetDir' is configured to be true but failed to remove target directory "${this.config.targetDir}"`);
                    throw ex;
                }
            }
            if (!(yield existsAsync(this.config.targetDir))) {
                try {
                    mkdirAsync(this.config.targetDir);
                }
                catch (ex) {
                    console.error(`Failed to create target directory "${this.config.targetDir}"`);
                    throw ex;
                }
            }
        });
    }
}
exports.Generator = Generator;
const mkdirAsync = util_1.promisify(fs_1.mkdir);
const rmdirAsync = util_1.promisify(fs_1.rmdir);
const existsAsync = util_1.promisify(fs_1.exists);
