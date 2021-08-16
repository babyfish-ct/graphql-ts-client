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
import { GraphQLField, GraphQLFieldMap, GraphQLInterfaceType, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { associatedTypeOf } from "./Associations";
import { GeneratorConfig } from "./GeneratorConfig";
import { InheritanceInfo } from "./InheritanceInfo";
import { ImportingBehavior, Writer } from "./Writer";

export class FetcherWriter extends Writer {

    private readonly fetcherTypeName: string;

    private readonly methodNames: string[];

    private readonly defaultFetcherProps: string[];

    readonly emptyFetcherName: string;

    readonly defaultFetcherName: string | undefined;

    readonly fieldMap: GraphQLFieldMap<any, any>;

    constructor(
        private readonly modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
        private inheritanceInfo: InheritanceInfo,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.fetcherTypeName = generatedFetcherTypeName(modelType, config);

        if (modelType instanceof GraphQLUnionType) {
            const map: { [key: string]: GraphQLField<any, any> } = {};
            const itemCount = modelType.getTypes().length;
            if (itemCount !== 0) {
                const fieldCountMap = new Map<string, number>();
                for (const type of modelType.getTypes()) {
                    for (const fieldName in type.getFields()) {
                        fieldCountMap.set(fieldName, (fieldCountMap.get(fieldName) ?? 0) + 1);
                    }
                }
                const firstTypeFieldMap = modelType.getTypes()[0].getFields();
                for (const fieldName in firstTypeFieldMap) {
                    if (fieldCountMap.get(fieldName) === itemCount) {
                        map[fieldName] = firstTypeFieldMap[fieldName]!;
                    }
                }
            }
            this.fieldMap = map;
        } else {
            this.fieldMap = modelType.getFields();
        }
      
        const methodNames: string[] = [];
        const defaultFetcherProps: string[] = [];
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName]!;
            const associatedType = associatedTypeOf(field.type);
            if (associatedType !== undefined) {
                methodNames.push(fieldName);
            } else {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }
        }
        this.methodNames = methodNames;
        this.defaultFetcherProps = defaultFetcherProps;

        let prefix = instancePrefix(this.modelType.name);
        this.emptyFetcherName = `${prefix}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${prefix}$$` : undefined;
    }

    protected prepareImportings() {
        this.importStatement("import { Fetcher, createFetcher } from 'graphql-ts-client-api';");
        this.importStatement("import { WithTypeName, ImplementationType } from '../CommonTypes';");
        
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            this.importFieldTypes(field);
        }

        const upcastTypes = this.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (upcastTypes !== undefined) {
            for (const upcastType of upcastTypes) {
                this.importStatement(`import { ${instancePrefix(upcastType.name)}$ } from './${upcastType.name}${this.config.fetcherSuffix ?? "Fetcher"}';`);
            }
        }
    }

    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior {
        if (type === this.modelType) {
            return "SELF";
        }
        if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
            return "SAME_DIR";
        }
        return "OTHER_DIR";
    }
    
    protected writeCode() {
        
        const t = this.text.bind(this);

        t(COMMENT);
        t("export interface ");
        t(this.fetcherTypeName);
        t("<T extends object> extends Fetcher<'");
        t(this.modelType.name);
        t("', T> ");
        this.enter("BLOCK", true);

        t("\n");
        t("readonly fetchedEntityType: '");
        t(this.modelType.name);
        t("';\n");
        
        t("\n");
        t("readonly __typename: ");
        t(this.fetcherTypeName);
        t("<T & {__typename: ImplementationType<'");
        t(this.modelType.name);
        t("'>}>;\n");

        t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object>`);
        this.scope({type: "PARAMETERS"}, () => {
            t("child: Fetcher<XName, X>");
        });
        t(`: ${this.fetcherTypeName}`);
        this.scope({type: "GENERIC", multiLines: true}, () => {
            t(`XName extends '${this.modelType.name}' ?\n`);
            t("T & X :\n");
            t(`WithTypeName<T, ImplementationType<'${this.modelType.name}'>> & `);
            this.scope({type: "BLANK", multiLines: true, prefix: "(", suffix: ")"}, () => {
                t("WithTypeName<X, ImplementationType<XName>>");
                this.separator(" | ");
                t(`{__typename: Exclude<ImplementationType<'${this.modelType}'>, ImplementationType<XName>>}`);
            });
        });
        t(";\n");

        if (!(this.modelType instanceof GraphQLUnionType)) {
            t("\nasFragment(name: string): Fetcher<");
            this.str(this.modelType.name);
            t(", T>;\n");
        }

        for (const fieldName in this.fieldMap) {
            t("\n");
            const field = this.fieldMap[fieldName]!;
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");

        this.writeInstances();
    }

    private writePositiveProp(field: GraphQLField<unknown, unknown>) {

        const t = this.text.bind(this);

        const associatedType = associatedTypeOf(field.type);
        
        if (field.args.length === 0 && associatedType === undefined) {
            t("readonly ");
            t(field.name);
        } else {
            const multiLines = 
                field.args.length + 
                (associatedType !== undefined ? 1 : 0) 
                > 1;
            t(field.name);
            if (associatedType !== undefined) {
                t("<X extends object>");
            }
            this.enter("PARAMETERS", multiLines);
            {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t("args: ");
                    this.enter("BLOCK", multiLines);
                    {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t(arg.name);
                            if (!(arg instanceof GraphQLNonNull)) {
                                t("?");
                            }
                            t(": ");
                            this.typeRef(arg.type)
                        }
                    }
                    this.leave();
                }
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t("Fetcher<'");
                    t(associatedType.name);
                    t("', X>");
                }
            }
            this.leave();
        }

        t(": ");
        t(this.fetcherTypeName);
        t("<T & {");
        if (!this.config.objectEditable) {
            t("readonly ");
        }
        t(field.name);
        if (!(field.type instanceof GraphQLNonNull)) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, associatedType !== undefined ? "X" : undefined);
        t("}>;\n");
    }

    private writeNegativeProp(field: GraphQLField<unknown, unknown>) {
        
        const t = this.text.bind(this);

        t('readonly "~');
        t(field.name);
        t('": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '");
        t(field.name);
        t("'>>;\n");
    }

    private writeInstances() {

        const t = this.text.bind(this);
        const itemTypes = this.modelType instanceof GraphQLUnionType ? this.modelType.getTypes() : [];

        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(generatedFetcherTypeName(this.modelType, this.config))
        t("<{}> = ")
        this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
            t("createFetcher")
            this.scope({type: "PARAMETERS", multiLines: true}, () => {
                this.scope({type: "BLOCK", multiLines: true}, () => {
                    t(`entityName: "${this.modelType.name}"`);
                    this.separator(", ");
                    t("superTypes: ");
                    this.scope({type: "ARRAY"}, () => {
                        const upcastTypes = this.inheritanceInfo.upcastTypeMap.get(this.modelType);
                        if (upcastTypes !== undefined) {
                            for (const upcastType of upcastTypes) {
                                this.separator(", ");
                                t(`${instancePrefix(upcastType.name)}$.fetchableType`);
                            }
                        }
                    });
                    this.separator(", ");
                    t("declaredFields: new Set<string>(");
                    this.scope({type: "ARRAY"}, () => {
                        for (const declaredFieldName of this.declaredFieldNames()) {
                            this.separator(", ");
                            t(`"${declaredFieldName}"`);
                        }
                    });
                    t(")");
                });
                this.separator(", ");
                if (itemTypes.length === 0) {
                    t("undefined");
                } else {
                    this.scope({type: "ARRAY", multiLines: itemTypes.length >= 2}, () => {
                        for (const itemType of itemTypes) {
                            this.separator(", ");
                            this.str(itemType.name);
                        }
                    });
                }
                this.separator(", ");
                this.scope({type: "ARRAY", multiLines: this.methodNames.length >= 2}, () => {
                    for (const methodName of this.methodNames) {
                        this.separator(", ");
                        this.str(methodName);
                    }
                });
            });
        });

        if (this.defaultFetcherName !== undefined) {
            t("\nexport const ");
            t(this.defaultFetcherName);
            t(" = ");
            this.enter("BLANK", true);
            t(this.emptyFetcherName);
            this.enter("BLANK", true);
            for (const propName of this.defaultFetcherProps) {
                t(".");
                t(propName);
                t("\n");
            }
            this.leave();
            this.leave(";");
        }
    }

    private declaredFieldNames(): Set<string> {
        const fields = new Set<string>();
        if (this.modelType instanceof GraphQLObjectType || this.modelType instanceof GraphQLInterfaceType) {
            const fieldMap = this.modelType.getFields();
            for (const fieldName in fieldMap) {
                fields.add(fieldMap[fieldName]!.name);
            }
            this.removeSuperFieldNames(fields, this.inheritanceInfo.upcastTypeMap.get(this.modelType));
        }
        return fields;
    }

    private removeSuperFieldNames(fields: Set<string>, superTypes?: Set<GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType>) {
        if (superTypes !== undefined) {
            for (const superType of superTypes) {
                if (superType instanceof GraphQLObjectType || superType instanceof GraphQLInterfaceType) {
                    const superFieldMap = superType.getFields();
                    for (const superFieldName in superFieldMap) {
                        fields.delete(superFieldName);
                    }
                }
                this.removeSuperFieldNames(fields, this.inheritanceInfo.upcastTypeMap.get(superType));
            }
        }
    }
}

export function generatedFetcherTypeName(
    fetcherType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
    config: GeneratorConfig
): string {
    const suffix = config.fetcherSuffix ?? "Fetcher";
    return `${fetcherType.name}${suffix}`;
}

const COMMENT = `/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
`;

function instancePrefix(name: string): string {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
