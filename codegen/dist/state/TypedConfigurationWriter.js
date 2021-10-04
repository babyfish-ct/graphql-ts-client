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
            if (!this.ctx.connectionTypes.has(fetfherType) && !this.ctx.edgeTypes.has(fetfherType)) {
                this.importStatement(`import { ${fetfherType.name}ChangeEvent } from './triggers';`);
            }
        }
    }
    writeCode() {
        const t = this.text.bind(this);
        t("export function newTypedConfiguration() ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t("return newConfiguration()");
            this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    t(`.addObjectFetcher(${Utils_1.instancePrefix(fetcherType.name)}$)`);
                }
            });
        });
        this.writeSchema();
    }
    writeSchema() {
        const t = this.text.bind(this);
        t("export interface Schema ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const fetcherType of this.ctx.fetcherTypes) {
                if (fetcherType.name === "Mutation" ||
                    fetcherType instanceof graphql_1.GraphQLUnionType ||
                    this.ctx.connectionTypes.has(fetcherType) ||
                    this.ctx.edgeTypes.has(fetcherType)) {
                    continue;
                }
                t(`readonly "${fetcherType.name}": `);
                this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
                    const idField = this.ctx.idFieldMap.get(fetcherType);
                    if (idField !== undefined) {
                        t(`readonly " $id": `);
                        this.typeRef(idField.type);
                        t(";\n");
                    }
                    t(`readonly " $event": ${fetcherType.name}ChangeEvent`);
                });
            }
        });
    }
}
exports.TypedConfigurationWriter = TypedConfigurationWriter;
