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
exports.TypedConfigurationWriter = void 0;
const graphql_1 = require("graphql");
const Utils_1 = require("../Utils");
const Writer_1 = require("../Writer");
class TypedConfigurationWriter extends Writer_1.Writer {
    constructor(ctx, stream, config) {
        super(stream, config);
        this.ctx = ctx;
    }
    isUnderGlobalDir() {
        return true;
    }
    prepareImportings() {
        this.importStatement(`import { newConfiguration } from 'graph-state';`);
        for (const fetfherType of this.ctx.fetcherTypes) {
            this.importStatement(`import { ${Utils_1.instancePrefix(fetfherType.name)}$ } from './fetchers';`);
        }
    }
    writeCode() {
        const t = this.text.bind(this);
        t("export function newTypedConfiguration() ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t("return newConfiguration()");
            this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    if (fetcherType instanceof graphql_1.GraphQLObjectType && this.ctx.connectionTypes.has(fetcherType)) {
                        t(`.addConnectionFetcher(${Utils_1.instancePrefix(fetcherType.name)}$)`);
                    }
                    else if (fetcherType instanceof graphql_1.GraphQLObjectType && this.ctx.edgeTypes.has(fetcherType)) {
                        t(`.addEdgeFetcher(${Utils_1.instancePrefix(fetcherType.name)}$)`);
                    }
                    else {
                        t(`.addObjectFetcher(${Utils_1.instancePrefix(fetcherType.name)}$)`);
                    }
                }
            });
        });
    }
}
exports.TypedConfigurationWriter = TypedConfigurationWriter;
