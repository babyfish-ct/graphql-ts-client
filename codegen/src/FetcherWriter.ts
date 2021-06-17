import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class FetcherWriter extends Writer {
    
    private fetcherSuffix: string;

    constructor(
        private modelType: GraphQLObjectType | GraphQLInterfaceType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.fetcherSuffix = this.config.fetcherSuffix ?? DEFAULT_FETCHER_SUBFFIX;
    }

    protected importTypes() {

    }
    
    protected writeCode() {
        
        const t = this.text.bind(this);

        t("import { Fetcher } from 'graphql-ts-client-api';\n\n");

        t("export interface ");
        t(this.modelType.name);
        t(this.fetcherSuffix);
        t("<T> extends Fetcher<T> ");
        this.enter("BLOCK");
        t("\n");

        const fieldMap = this.modelType.getFields();
        for (const fieldName in fieldMap) {
            t("\n");
            const field = fieldMap[fieldName]!;
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }

        this.leave();
        t("\n");
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
                    this.enter("NONE");
                    for (const associatedType of associatedTypes) {
                        this.separator(" | ");
                        t(associatedType.name);
                        t(this.fetcherSuffix);
                        t("<X>");
                    }
                    this.leave();
                }
            }
            this.leave();
        }

        t(": ");
        t(this.modelType.name);
        t(this.fetcherSuffix);
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
        t(this.modelType.name);
        t(this.fetcherSuffix);
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

export const DEFAULT_FETCHER_SUBFFIX = "Fetcher";