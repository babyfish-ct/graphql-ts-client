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
        this.importStatement(`import { Configuration, newConfiguration } from 'graph-state';`);
        for (const fetcherType of this.ctx.fetcherTypes) {
            this.importStatement(`import { ${Utils_1.instancePrefix(fetcherType.name)}$ } from './fetchers';`);
            if (fetcherType.name !== "Query" &&
                fetcherType.name !== "Mutation" &&
                !this.ctx.connectionTypes.has(fetcherType) &&
                !this.ctx.edgeTypes.has(fetcherType)) {
                this.importStatement(`import { ${fetcherType.name}ChangeEvent } from './triggers';`);
            }
        }
    }
    writeCode() {
        const t = this.text.bind(this);
        t("export function newTypedConfiguration(): Configuration<Schema> ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t("return newConfiguration<Schema>");
            this.scope({ type: "PARAMETERS", multiLines: true, suffix: ";\n" }, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    this.separator(", ");
                    t(Utils_1.instancePrefix(fetcherType.name));
                    t("$");
                }
            });
        });
        this.writeSchema();
    }
    writeSchema() {
        const t = this.text.bind(this);
        t("\nexport type Schema = ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const fetcherType of this.ctx.fetcherTypes) {
                if (fetcherType.name === "Query" ||
                    fetcherType.name === "Mutation" ||
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
                    t(`readonly " $event": ${fetcherType.name}ChangeEvent;\n`);
                    const fieldAssociationTypeMap = this.associationTypeMap(fetcherType);
                    t(`readonly " $associations": `);
                    this.scope({ type: "BLOCK", multiLines: fieldAssociationTypeMap.size > 1, suffix: ";\n" }, () => {
                        for (const [fieldName, type] of fieldAssociationTypeMap) {
                            this.separator(", ");
                            t(`readonly ${fieldName}: "${type}"`);
                        }
                    });
                });
            }
        });
    }
    associationTypeMap(fetcherType) {
        const map = new Map();
        const fieldMap = fetcherType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            const associatedType = Utils_1.associatedTypeOf(field.type);
            if (associatedType !== undefined) {
                const connection = this.ctx.connectionTypes.get(associatedType);
                if (connection !== undefined) {
                    map.set(fieldName, connection.nodeType.name);
                }
                else {
                    map.set(fieldName, associatedType.name);
                }
            }
        }
        return map;
    }
}
exports.TypedConfigurationWriter = TypedConfigurationWriter;
