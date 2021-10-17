/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { eventNames } from "process";
import { FetcherContext } from "../FetcherContext";
import { GeneratorConfig } from "../GeneratorConfig";
import { associatedTypeOf, instancePrefix } from "../Utils";
import { Writer } from "../Writer";

export class TypedConfigurationWriter extends Writer {

    constructor(
        private ctx: FetcherContext,
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    protected isUnderGlobalDir(): boolean {
        return true;
    }

    protected prepareImportings() {
        this.importStatement(`import { Configuration, newConfiguration } from 'graphql-state';`);
        const eventTypeNames: string[] = [];
        const instanceNames: string[] = [];
        for (const fetcherType of this.ctx.fetcherTypes) {
            if (fetcherType.name !== "Mutation" &&
            !this.ctx.connectionTypes.has(fetcherType) && 
            !this.ctx.edgeTypes.has(fetcherType)) {
                if (fetcherType.name !== 'Query') {
                    eventTypeNames.push(`${fetcherType.name}ChangeEvent`);
                }
                instanceNames.push(`${instancePrefix(fetcherType.name)}$`);
            }
        }
        const indent = this.config.indent ?? "    ";
        const separator = `,\n${indent}`; 
        if (instanceNames.length !== 0) {
            this.importStatement(`import {\n${indent}${
                instanceNames.join(separator)
            }\n} from './fetchers';`);
        }
        if (this.ctx.typesWithParameterizedField.size !== 0) {
            this.importStatement(`import {\n${indent}${
                Array.from(this.ctx.typesWithParameterizedField).map(type => `${type.name}Args`).join(separator)
            }\n} from './fetchers';`);
        }
        if (eventTypeNames.length !== 0) {
            this.importStatement(`import {\n${indent}${
                eventTypeNames.join(separator)
            }\n} from './triggers';`);
        }
    }

    protected writeCode() {
        const t = this.text.bind(this);
        t("export function newTypedConfiguration(): Configuration<Schema> ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            t("return newConfiguration<Schema>");
            this.scope({type: "PARAMETERS", multiLines: true, suffix: ";\n"}, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    this.separator(", ");
                    t(instancePrefix(fetcherType.name));
                    t("$");
                }
            });
        });
        this.writeSchema();
    }

    private writeSchema() {
        const t = this.text.bind(this);
        t("\nexport type Schema = ");
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            
            t("readonly query: ");
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                t(`readonly " $associationArgs": `);
                this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                    const queryType = this.ctx.fetcherTypes.find(type => type.name === "Query");
                    if (queryType instanceof GraphQLObjectType || queryType instanceof GraphQLInterfaceType) {
                        const fieldMap = queryType.getFields();
                        for (const fieldName in fieldMap) {
                            if (fieldMap[fieldName].args.length !== 0) {
                                this.separator(", ");
                                t(`readonly ${fieldName}: ${queryType.name}Args["${fieldName}"]`);
                            }
                        }
                    }
                });
            });
            
            t("readonly entities: ");
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    if (fetcherType.name === "Query" || 
                    fetcherType.name === "Mutation" ||
                    fetcherType instanceof GraphQLUnionType ||
                    this.ctx.connectionTypes.has(fetcherType) ||
                    this.ctx.edgeTypes.has(fetcherType)) {
                        continue;
                    }
                    t(`readonly "${fetcherType.name}": `);
                    this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                        
                        const idField = this.ctx.idFieldMap.get(fetcherType);
                        if (idField !== undefined) {
                            t(`readonly " $id": `);
                            this.typeRef(idField.type);
                            t(";\n");
                        }
    
                        t(`readonly " $event": ${fetcherType.name}ChangeEvent;\n`);
    
                        const fieldAssociationTypeMap = this.associationTypeMap(fetcherType);
                        t(`readonly " $associationTypes": `);
                        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                            for (const [fieldName, typeName] of fieldAssociationTypeMap) {
                                this.separator(", ");
                                t(`readonly ${fieldName}: "${typeName}"`);
                            }
                        });
    
                        t(`readonly " $associationArgs": `);
                        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                            const fieldMap = fetcherType.getFields();
                            for (const fieldName in fieldMap) {
                                if (fieldMap[fieldName].args.length !== 0) {
                                    this.separator(", ");
                                    t(`readonly ${fieldName}: ${fetcherType.name}Args["${fieldName}"]`);
                                }
                            }
                        });
                    })
                }
            });
        });
    }

    private associationTypeMap(
        fetcherType: GraphQLObjectType | GraphQLInterfaceType
    ): Map<string, string> {
        const map = new Map<string, string>();
        const fieldMap = fetcherType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            const associatedType = associatedTypeOf(field.type);
            if (associatedType !== undefined) {
                const connection = this.ctx.connectionTypes.get(associatedType);
                if (connection !== undefined) {
                    map.set(fieldName, connection.nodeType.name);
                } else {
                    map.set(fieldName, associatedType.name);
                }
            }
        }
        return map;
    }
}