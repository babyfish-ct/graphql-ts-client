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
import { FetcherContext } from "../FetcherContext";
import { GeneratorConfig } from "../GeneratorConfig";
import { targetTypeOf, instancePrefix } from "../Utils";
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
        const scalarTypeNames: string[] = [];
        const eventTypeNames: string[] = [];
        
        const instanceNames: string[] = [];
        for (const fetcherType of this.ctx.fetcherTypes) {
            if (this.ctx.triggerableTypes.has(fetcherType)) {
                if (fetcherType.name !== "Query") {
                    scalarTypeNames.push(`${fetcherType.name}ScalarType`);
                    eventTypeNames.push(`${fetcherType.name}EvictEvent`);
                    eventTypeNames.push(`${fetcherType.name}ChangeEvent`);
                }
            }
            instanceNames.push(`${instancePrefix(fetcherType.name)}$`);
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
                Array.from(this.ctx.typesWithParameterizedField)
                .filter(type => type.name !== 'Mutation')
                .map(type => `${type.name}Args`)
                .join(separator)
            }\n} from './fetchers';`);
        }
        if (eventTypeNames.length !== 0) {
            this.importStatement(`import {\n${indent}${
                scalarTypeNames.join(separator)
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
            
            const queryType = this.ctx.fetcherTypes.find(type => type.name === 'Query') as GraphQLObjectType;
            if (queryType !== undefined) {
                t("readonly query: ");
                this.writeFetcherType(queryType);
            }
            
            t("readonly entities: ");
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    if (fetcherType.name !== "Query" && 
                        fetcherType.name !== "Mutation" && 
                        !(fetcherType instanceof GraphQLUnionType) &&
                        this.ctx.entityTypes.has(fetcherType) &&
                        this.ctx.triggerableTypes.has(fetcherType)
                    ) {
                        t(`readonly "${fetcherType.name}": `);
                        this.writeFetcherType(fetcherType);
                    }
                }
            });
        });
    }

    private writeFetcherType(fetcherType: GraphQLObjectType | GraphQLInterfaceType) {

        const t = this.text.bind(this);

        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            
            if (fetcherType.name !== 'Query') {

                const idField = this.ctx.idFieldMap.get(fetcherType);
                if (idField !== undefined) {
                    t(`readonly " $id": `);
                    this.typeRef(idField.type);
                    t(";\n");
                }

                t(`readonly " $evictEvent": ${fetcherType.name}EvictEvent;\n`);
                t(`readonly " $changeEvent": ${fetcherType.name}ChangeEvent;\n`);
            }

            const fieldMap = fetcherType.getFields();
            const associationTypeMap = this.associationTypeMapOf(fetcherType);

            t(`readonly " $associationTypes": `);
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                for (const [fieldName, typeName] of associationTypeMap) {
                    this.separator(", ");
                    t(`readonly ${fieldName}: "${typeName}"`);
                }
            });

            t(`readonly " $associationArgs": `);
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                for (const fieldName in fieldMap) {
                    if (fieldMap[fieldName].args.length !== 0) {
                        this.separator(", ");
                        t(`readonly ${fieldName}: ${fetcherType.name}Args["${fieldName}"]`);
                    }
                }
            });

            t(`readonly " $associationTargetTypes": `);
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                const triggerableTypeNames = new Set<string>(
                    Array
                    .from(this.ctx.triggerableTypes)
                    .map(it => (it as GraphQLObjectType | GraphQLInterfaceType).name)
                );
                for (const [fieldName, typeName] of associationTypeMap) {
                    if (triggerableTypeNames.has(typeName)) {
                        this.separator(", ");
                        t(`readonly ${fieldName}: ${typeName}ScalarType`);
                    }
                }
            });
        })
    }
    
    private associationTypeMapOf(
        fetcherType: GraphQLObjectType | GraphQLInterfaceType
    ): Map<string, string> {
        const map = new Map<string, string>();
        const fieldMap = fetcherType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            const targetType = targetTypeOf(field.type);
            if (targetType !== undefined && !this.ctx.embeddedTypes.has(targetType)) {
                const connection = this.ctx.connections.get(targetType);
                if (connection !== undefined) {
                    map.set(fieldName, connection.nodeType.name);
                } else {
                    map.set(fieldName, targetType.name);
                }
            }
        }
        return map;
    }
}
