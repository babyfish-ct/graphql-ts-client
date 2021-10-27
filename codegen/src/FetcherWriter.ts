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
import { GraphQLArgument, GraphQLField, GraphQLFieldMap, GraphQLInterfaceType, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { targetTypeOf, instancePrefix } from "./Utils";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";
import { FetcherContext } from "./FetcherContext";
import { throws } from "assert";

export class FetcherWriter extends Writer {

    protected readonly fetcherTypeName: string;

    protected readonly defaultFetcherProps: string[];

    readonly emptyFetcherName: string;

    readonly defaultFetcherName: string | undefined;

    readonly fieldMap: GraphQLFieldMap<any, any>;

    protected fieldArgsMap: Map<string, GraphQLArgument[]>;

    protected fieldCategoryMap: Map<string, string>;

    protected hasArgs: boolean;

    private _declaredFieldNames?: ReadonlySet<string>;

    constructor(
        protected modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
        protected ctx: FetcherContext,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);

        this.fetcherTypeName = `${this.modelType.name}${config.fetcherSuffix ?? "Fetcher"}`;

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
      
        const fieldArgsMap = new Map<string, GraphQLArgument[]>();
        const fieldCategoryMap = new Map<string, string>();
        const defaultFetcherProps: string[] = [];
        this.hasArgs = false;
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName]!;
            const targetType = targetTypeOf(field.type);
            if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation" && targetType === undefined && field.args.length === 0) {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }

            if (field.args.length !== 0) {
                fieldArgsMap.set(fieldName, field.args);
            }

            const fieldCoreType = 
                field.type instanceof GraphQLNonNull ?
                field.type.ofType :
                field.type;
            if (this.ctx.embeddedTypes.has(fieldCoreType)) {
                fieldCategoryMap.set(fieldName, "SCALAR");
            } else if (this.ctx.connections.has(fieldCoreType)) {
                fieldCategoryMap.set(fieldName, "CONNECTION");
            } else if (fieldCoreType instanceof GraphQLList) {
                const elementType = 
                    fieldCoreType.ofType instanceof GraphQLNonNull ?
                    fieldCoreType.ofType.ofType :
                    fieldCoreType.ofType;
                if (elementType instanceof GraphQLObjectType ||
                    elementType instanceof GraphQLInterfaceType ||
                    elementType instanceof GraphQLUnionType
                ) {
                    fieldCategoryMap.set(fieldName, "LIST");
                }
            } else if (fieldCoreType instanceof GraphQLObjectType ||
                fieldCoreType instanceof GraphQLInterfaceType ||
                fieldCoreType instanceof GraphQLUnionType
            ) {
                fieldCategoryMap.set(fieldName, "REFERENCE");
            } else if (this.ctx.idFieldMap.get(this.modelType) === field) {
                fieldCategoryMap.set(fieldName, "ID");
            } else {
                fieldCategoryMap.set(fieldName, "SCALAR");
            }

            if (field.args.length !== 0) {
                this.hasArgs = true;
            }
        }

        this.defaultFetcherProps = defaultFetcherProps;
        this.fieldArgsMap = fieldArgsMap;
        this.fieldCategoryMap = fieldCategoryMap;
        let prefix = instancePrefix(this.modelType.name);
        this.emptyFetcherName = `${prefix}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${prefix}$$` : undefined;
    }

    protected prepareImportings() {
        
        if (this.hasArgs) {
            this.importStatement("import type { AcceptableVariables, UnresolvedVariables, FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';");   
        } else {
            this.importStatement("import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';");
        }

        const importedFetcherTypeNames = new Set<string>();
        importedFetcherTypeNames.add(this.superFetcherTypeName(this.modelType));
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const targetType = targetTypeOf(field.type);
            if (targetType !== undefined) {
                importedFetcherTypeNames.add(this.superFetcherTypeName(targetType));
            }
        }
        this.importStatement(`import { ${Array.from(importedFetcherTypeNames).join(", ")}, createFetcher, createFetchableType } from 'graphql-ts-client-api';`);
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            this.importStatement("import type { WithTypeName, ImplementationType } from '../CommonTypes';");
        }
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            this.importFieldTypes(field);
        }

        const upcastTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (upcastTypes !== undefined) {
            for (const upcastType of upcastTypes) {
                this.importStatement(`import { ${
                    this.importedNamesForSuperType(upcastType).join(", ")
                } } from './${upcastType.name}${this.config.fetcherSuffix ?? "Fetcher"}';`);
            }
        }
    }

    protected importedNamesForSuperType(superType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType): string[] {
        return [ `${instancePrefix(superType.name)}$` ];
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
        t("<T extends object, TVariables extends object> extends ");
        t(this.superFetcherTypeName(this.modelType));
        t("<'");
        t(this.modelType.name);
        t("', T, TVariables> ");

        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            this.writeFragmentMethods();
            this.writeDirective();
            this.writeTypeName();

            for (const fieldName in this.fieldMap) {
                this.text("\n");
                const field = this.fieldMap[fieldName]!;
                this.writePositiveProp(field);
                this.writeNegativeProp(field);
            }
        });

        this.writeInstances();

        this.writeArgsInterface();
    }

    protected writeFragmentMethods() {

        const t = this.text.bind(this);

        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object, XVariables extends object>`);
            this.scope({type: "PARAMETERS", multiLines: !(this.modelType instanceof GraphQLUnionType)}, () => {
                t(`child: ${this.superFetcherTypeName(this.modelType)}<XName, X, XVariables>`);
                if (!(this.modelType instanceof GraphQLUnionType)) {
                    this.separator(", ");
                    t("fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment");
                }
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
                this.separator(", ");
                t("TVariables & XVariables");
            });
            t(";\n");
        }
    }

    private writeDirective() {
        
        const t = this.text.bind(this);

        t(`\n\ndirective(name: string, args?: DirectiveArgs): ${this.fetcherTypeName}<T, TVariables>;\n`);
    }

    private writeTypeName() {

        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            
            const t = this.text.bind(this);
            
            t("\n\n");
            t("readonly __typename: ");
            t(this.fetcherTypeName);
            t("<T & {__typename: ImplementationType<'");
            t(this.modelType.name);
            t("'>}, TVariables>;\n");
        }
    }

    private writePositiveProp(field: GraphQLField<unknown, unknown>) {
        
        const targetType = targetTypeOf(field.type);

        const isField = field.args.length === 0 && targetType === undefined;
        
        if (field.args.length !== 0) {
            this.writePositivePropImpl(field, "NO_ARGS");
        }
        this.writePositivePropImpl(field, "NORMAL");

        if (isField) {
            this.writePositivePropImpl(field, "FIELD_PLUS");
        }
    }

    private writeNegativeProp(field: GraphQLField<unknown, unknown>) {
        
        if (field.args.length !== 0 ||  targetTypeOf(field.type) !== undefined) {
            return;
        }

        const t = this.text.bind(this);

        t('\nreadonly "~');
        t(field.name);
        t('": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '");
        t(field.name);
        t("'>, TVariables>;\n");
    }

    private writePositivePropImpl(field: GraphQLField<unknown, unknown>, mode: "NORMAL" | "NO_ARGS" | "FIELD_PLUS") {

        const t = this.text.bind(this);

        const targetType = targetTypeOf(field.type);
        
        const renderAsField = field.args.length === 0 && targetType === undefined && mode !== "FIELD_PLUS";

        const nonNull = field.type instanceof GraphQLNonNull;

        t("\n");
        if (renderAsField) {
            t("readonly ");
            t(field.name);
        } else {
            t(mode === "FIELD_PLUS" ? `"${field.name}+"` : field.name);
            this.scope({type: "GENERIC", multiLines: true}, () => {
                if (field.args.length !== 0 && mode != "NO_ARGS") {
                    this.separator(", ");
                    t(`XArgs extends AcceptableVariables<${this.modelType.name}Args['${field.name}']>`);
                }
                if (targetType !== undefined) {
                    this.separator(", ");
                    t("X extends object");
                    this.separator(", ");
                    t("XVariables extends object");
                }
                this.separator(", ");
                t(`XAlias extends string = "${field.name}"`);
                if (nonNull) {
                    this.separator(", ");
                    t(`XDirectives extends { readonly [key: string]: DirectiveArgs } = {}`);
                }
                if (!renderAsField) {
                    this.separator(", ");
                    t(`XDirectiveVariables extends object = {}`);
                }
            });
            this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                if (field.args.length !== 0 && mode !== "NO_ARGS") {
                    this.separator(", ");
                    t("args: XArgs");
                }
                if (targetType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t(this.superFetcherTypeName(targetType));
                    t("<'");
                    t(targetType.name);
                    t("', X, XVariables>");
                }
                this.separator(", ");
                t("optionsConfigurer?: ");
                this.scope({type: "PARAMETERS", multiLines: true}, () => {
                    t(`options: FieldOptions<"${field.name}", {}, {}>`);
                });
                t(` => FieldOptions<XAlias, ${nonNull ? "XDirectives" : "{readonly [key: string]: DirectiveArgs}"}, XDirectiveVariables>`);
            });
        }

        t(": ");
        t(this.fetcherTypeName);
        this.scope({type: "GENERIC", multiLines: !renderAsField, suffix: ";\n"}, () => {
            
            t("T & ");
            
            if (nonNull) {
                if (renderAsField) {
                    this.writePositivePropChangedDataType(field, renderAsField, false);
                } else {
                    this.scope({type: "PARAMETERS", multiLines: true}, () => {
                        t("XDirectives extends { readonly include: any } | { readonly skip: any } ? ");
                        this.scope({type: "BLANK", multiLines: true}, () => {
                            this.writePositivePropChangedDataType(field, renderAsField, true);
                            this.separator(" : ");
                            this.writePositivePropChangedDataType(field, renderAsField, false);    
                        });
                    });
                }
            } else {
                this.writePositivePropChangedDataType(field, renderAsField, true);
            }

            this.separator(", ");
            t("TVariables");
            if (targetType !== undefined) {
                t(" & XVariables");
            }
            if (field.args.length !== 0) {
                if (mode === "NO_ARGS") {
                    t(` & ${this.modelType.name}Args["${field.name}"]`);
                } else {
                    t(` & UnresolvedVariables<XArgs, ${this.modelType.name}Args['${field.name}']>`);
                }
            }
            if (!renderAsField) {
                t(" & XDirectiveVariables");
            }
        });
    }

    private writePositivePropChangedDataType(field: GraphQLField<unknown, unknown>, renderAsField: boolean, nullable: boolean) {
        const t = this.text.bind(this);
        t("{");
        if (!this.config.objectEditable) {
            t("readonly ");
        }
        if (renderAsField) {
            t(`"${field.name}"`);
        } else {
            t(`[key in XAlias]`);
        }
        if (nullable) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, targetTypeOf(field.type) !== undefined ? "X" : undefined);
        t("}");
    }

    private writeInstances() {

        const t = this.text.bind(this);
        const itemTypes = this.modelType instanceof GraphQLUnionType ? this.modelType.getTypes() : [];

        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(this.fetcherTypeName)
        t("<{}, {}> = ")
        this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
            t("createFetcher")
            this.scope({type: "PARAMETERS", multiLines: true}, () => {
                t("createFetchableType")
                this.scope({type: "PARAMETERS", multiLines: true}, () => {
                    t(`"${this.modelType.name}"`);
                    this.separator(", ");
                    if (this.ctx.embeddedTypes.has(this.modelType)) {
                        t('"EMBEDDED"');
                    } else if (this.ctx.connections.has(this.modelType)) {
                        t('"CONNECTION"');
                    } else if (this.ctx.edgeTypes.has(this.modelType)) {
                        t('"EDGE"');
                    } else {
                        t('"OBJECT"');
                    }
                    this.separator(", ");
                    this.scope({type: "ARRAY"}, () => {
                        const upcastTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
                        if (upcastTypes !== undefined) {
                            for (const upcastType of upcastTypes) {
                                this.separator(", ");
                                t(`${instancePrefix(upcastType.name)}$.fetchableType`);
                            }
                        }
                    });
                    this.separator(", ");
                    this.scope({type: "ARRAY", multiLines: true }, () => {
                        for (const declaredFieldName of this.declaredFieldNames) {
                            const field = this.fieldMap[declaredFieldName];
                            this.separator(", ");
                            const args = this.fieldArgsMap.get(declaredFieldName);
                            const category = this.fieldCategoryMap.get(declaredFieldName);
                            const targetType = targetTypeOf(field.type);
                            if (args === undefined && 
                                (category === undefined || category === "SCALAR") &&
                                field.type instanceof GraphQLNonNull
                            ) {
                                if (targetType === undefined) {
                                    t(`"${declaredFieldName}"`);
                                } else {
                                    this.scope({type: "BLOCK", multiLines: true}, () => {
                                        t(`category: "SCALAR"`);
                                        this.separator(", ");
                                        t(`name: "${declaredFieldName}"`); 
                                        this.separator(", ");
                                        t(`targetTypeName: "${targetType.name}"`);
                                    });
                                }
                            } else {
                                this.scope({type: "BLOCK", multiLines: true}, () => {
                                    t(`category: "${category ?? 'SCALAR'}"`);
                                    this.separator(", ");
                                    t(`name: "${declaredFieldName}"`);
                                    if (args !== undefined) {
                                        this.separator(", ");
                                        t("argGraphQLTypeMap: ");
                                        this.scope({type: "BLOCK", multiLines: args.length > 1}, () => {
                                            for (const arg of args) {
                                                this.separator(", ");
                                                t(arg.name);
                                                t(": '");
                                                this.gqlTypeRef(arg.type);
                                                t("'");
                                            }
                                        });
                                    }
                                    if (targetType !== undefined) {
                                        this.separator(", ");
                                        const connection = this.ctx.connections.get(targetType);
                                        if (connection !== undefined) {
                                            t(`connectionTypeName: "${targetType.name}"`);
                                            this.separator(", ");
                                            t(`edgeTypeName: "${connection.edgeType.name}"`);
                                            this.separator(", ");
                                            t(`targetTypeName: "${connection.nodeType.name}"`);
                                        } else {
                                            t(`targetTypeName: "${targetType.name}"`);
                                        }
                                    }
                                    if (!(field.type instanceof GraphQLNonNull)) {
                                        this.separator(", ");
                                        t("undefinable: true");
                                    }
                                });
                            }
                        }
                    });
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
            this.leave(";\n");
        }
    }

    private writeArgsInterface() {

        if (!this.hasArgs) {
            return;
        }

        const t = this.text.bind(this);
        t(`\nexport interface ${this.modelType.name}Args `);
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const fieldName in this.fieldMap) {
                const field = this.fieldMap[fieldName];
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`\nreadonly ${field.name}: `);
                    this.scope({type: "BLOCK", multiLines: true}, () => {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t("readonly ");
                            t(arg.name);
                            if (!(arg.type instanceof GraphQLNonNull)) {
                                t("?");
                            }
                            t(": ");
                            this.typeRef(arg.type)
                        }
                    });
                }
            }
        });
    }

    protected get declaredFieldNames(): ReadonlySet<string> {
        let set = this._declaredFieldNames;
        if (set === undefined) {
            this._declaredFieldNames = set = this.getDeclaredFieldNames();
        }
        return set;
    }

    private getDeclaredFieldNames(): ReadonlySet<string> {
        const fields = new Set<string>();
        if (this.modelType instanceof GraphQLObjectType || this.modelType instanceof GraphQLInterfaceType) {
            const fieldMap = this.modelType.getFields();
            for (const fieldName in fieldMap) {
                fields.add(fieldMap[fieldName]!.name);
            }
            this.removeSuperFieldNames(fields, this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType));
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
                this.removeSuperFieldNames(fields, this.ctx.inheritanceInfo.upcastTypeMap.get(superType));
            }
        }
    }

    private superFetcherTypeName(graphQLType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType): string {
        if (this.ctx.connections.has(graphQLType)) {
            return "ConnectionFetcher";
        }
        if (this.ctx.edgeTypes.has(graphQLType)) {
            return "EdgeFetcher";
        }
        return "ObjectFetcher";
    }
}

const COMMENT = `/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
`;

