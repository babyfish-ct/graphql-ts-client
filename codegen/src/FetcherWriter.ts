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
import { GraphQLField, GraphQLInterfaceType, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { associatedTypesOf } from "./Associations";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";

export class FetcherWriter extends Writer {

    private readonly fetcherTypeName: string;

    private readonly methodNames: string[];

    private readonly defaultFetcherProps: string[];

    readonly emptyFetcherName: string;

    readonly defaultFetcherName: string | undefined;

    constructor(
        private readonly modelType: GraphQLObjectType | GraphQLInterfaceType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.fetcherTypeName = generatedFetcherTypeName(modelType, config);

        const fieldMap = this.modelType.getFields();
        const methodNames = [];
        const defaultFetcherProps = [];
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName]!;
            if (associatedTypesOf(field.type).length !== 0) {
                methodNames.push(fieldName);
            } else if (field.args.length === 0) {
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

        let instanceName = this.modelType.name;
        instanceName = 
            instanceName.substring(0, 1).toLowerCase() +
            instanceName.substring(1);
        this.emptyFetcherName = `${instanceName}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${instanceName}$$` : undefined;
    }

    protected prepareImportings() {
        this.importStatement("import { Fetcher, createFetcher } from 'graphql-ts-client-api';");
        const fieldMap = this.modelType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            this.importFieldTypes(field);
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
        t("<T & {__typename: '");
        t(this.modelType.name);
        t("'}>;\n");
        t('readonly "~__typename": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '__typename'>>;\n");

        const fieldMap = this.modelType.getFields();
        for (const fieldName in fieldMap) {
            t("\n");
            const field = fieldMap[fieldName]!;
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");

        this.writeInstances();
    }

    private writePositiveProp(field: GraphQLField<unknown, unknown>) {

        const t = this.text.bind(this);

        const associatedTypes = associatedTypesOf(field.type);
        
        if (field.args.length === 0 && associatedTypes.length === 0) {
            t("readonly ");
            t(field.name);
        } else {
            const multiLines = 
                field.args.length + 
                (associatedTypes.length !== 0 ? 1 : 0) 
                > 1;
            t(field.name);
            if (associatedTypes.length !== 0) {
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
                if (associatedTypes.length !== 0) {
                    this.separator(", ");
                    t("child: ");
                    this.enter("BLANK");
                    for (const associatedType of associatedTypes) {
                        this.separator(" | ");
                        t("Fetcher<'");
                        t(associatedType.name);
                        t("', X>");
                    }
                    this.leave();
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
        this.typeRef(field.type, associatedTypes.length !== 0 ? "X" : undefined);
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

        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(generatedFetcherTypeName(this.modelType, this.config))
        t("<{}> = ")
        this.enter("BLANK", true);
        t("createFetcher")
        this.enter("PARAMETERS", this.methodNames.length > 1);
        t("'")
        t(this.modelType.name);
        t("'");
        for (const methodName of this.methodNames) {
            this.separator(", ");
            t("'");
            t(methodName);
            t("'");
        }
        this.leave(";");
        this.leave();

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
            this.leave(";");
            this.leave();
        }
    }
}

export function generatedFetcherTypeName(
    fetcherType: GraphQLObjectType | GraphQLInterfaceType,
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