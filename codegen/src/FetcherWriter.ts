import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";

export class FetcherWriter extends Writer {

    private genartedName: string;

    constructor(
        private modelType: GraphQLObjectType | GraphQLInterfaceType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.genartedName = generatedFetcherTypeName(modelType, config);
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

        t("export interface ");
        t(this.genartedName);
        t("<T> extends Fetcher<T> ");
        this.enter("BLOCK");
        t("\n");

        const fieldMap = this.modelType.getFields();
        const methodNames = [];
        const propNames = [];
        for (const fieldName in fieldMap) {
            t("\n");
            const field = fieldMap[fieldName]!;
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
            if (associatedTypesOf(field.type).length !== 0) {
                methodNames.push(fieldName);
            } else if (field.args.length === 0) {
                propNames.push(fieldName);
            }
        }

        this.leave();
        t("\n");

        t("\nexport const ");
        t(this.modelType.name);
        t("$ = createFetcher<");
        t(generatedFetcherTypeName(this.modelType, this.config))
        t("<{}>>")
        this.enter("PARAMETERS", methodNames.length > 3);
        for (const methodName of methodNames) {
            this.separator(", ");
            t("'");
            t(methodName);
            t("'");
        }
        this.leave();
        t(";\n");

        if (propNames.length !== 0) {
            t("\nexport const ");
            t(this.modelType.name);
            t("$$ = ");
            t(this.modelType.name);
            t("$");
            this.enter("BLANK", true);
            for (const propName of propNames) {
                t(".");
                t(propName);
                t("\n");
            }
            this.leave();
            t(";\n");
        }
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
                t("<X>");
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
                        t(generatedFetcherTypeName(associatedType, this.config));
                        t("<X>");
                    }
                    this.leave();
                }
            }
            this.leave();
        }

        t(": ");
        t(this.genartedName);
        t("<T & {");
        if (!this.config.modelEditable) {
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
        t(this.genartedName);
        t("<Omit<T, '");
        t(field.name);
        t("'>>;\n");
    }
}

function associatedTypesOf(type: GraphQLType): Array<GraphQLObjectType | GraphQLInterfaceType> {
    if (type instanceof GraphQLNonNull) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof GraphQLList) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
        return [type];
    }
    if (type instanceof GraphQLUnionType) {
        return type.getTypes();
    }
    return [];
}

export function generatedFetcherTypeName(
    fetcherType: GraphQLObjectType | GraphQLInterfaceType,
    config: GeneratorConfig
): string {
    const suffix = config.fetcherSuffix ?? "Fetcher";
    return `${fetcherType.name}${suffix}`;
}