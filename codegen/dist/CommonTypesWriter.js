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
exports.CommonTypesWriter = void 0;
const graphql_1 = require("graphql");
const Writer_1 = require("./Writer");
class CommonTypesWriter extends Writer_1.Writer {
    constructor(schema, stream, config) {
        super(stream, config);
        this.schema = schema;
    }
    writeCode() {
        this.writeWithTypeNameType();
        this.writeImplementationType();
    }
    writeWithTypeNameType() {
        this.text(WITH_TYPE_NAME_DECLARATION);
        this.text("\n");
    }
    writeImplementationType() {
        const t = this.text.bind(this);
        const implementationTypeMap = new Map();
        const typeMap = this.schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__")) {
                const type = typeMap[typeName];
                if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
                    for (const itf of type.getInterfaces()) {
                        CommonTypesWriter._add(implementationTypeMap, itf.name, typeName);
                    }
                }
                if (type instanceof graphql_1.GraphQLUnionType) {
                    for (const item of type.getTypes()) {
                        CommonTypesWriter._add(implementationTypeMap, typeName, item.name);
                    }
                }
            }
        }
        CommonTypesWriter._removeSuperfluous(implementationTypeMap);
        t(IMPLEMENTATION_TYPE_COMMENT);
        t("export type ImplementationType<T> = ");
        this.enter("BLANK", true);
        for (const [type, implementationTypes] of implementationTypeMap) {
            t("T extends '");
            t(type);
            t("' ? ");
            this.enter("BLANK");
            if (!(typeMap[type] instanceof graphql_1.GraphQLUnionType)) {
                t("'");
                t(type);
                t("'");
            }
            for (const implementationType of implementationTypes) {
                this.separator(" | ");
                t("ImplementationType<'");
                t(implementationType);
                t("'>");
            }
            this.leave();
            t(" :\n");
        }
        t("T\n");
        this.leave();
        t(";");
    }
    static _add(implementationTypeMap, type, implementationType) {
        let set = implementationTypeMap.get(type);
        if (set === undefined) {
            set = new Set();
            implementationTypeMap.set(type, set);
        }
        set.add(implementationType);
    }
    static _removeSuperfluous(implementationTypeMap) {
        for (const [, set] of implementationTypeMap) {
            CommonTypesWriter._removeSuperfluous0(set, set, implementationTypeMap);
        }
    }
    static _removeSuperfluous0(targetImplementationTypes, currentImplementationTypes, implementationTypeMap) {
        for (const currentType of currentImplementationTypes) {
            if (targetImplementationTypes !== currentImplementationTypes) {
                targetImplementationTypes.delete(currentType);
            }
            const deeperSet = implementationTypeMap.get(currentType);
            if (deeperSet !== undefined) {
                CommonTypesWriter._removeSuperfluous0(targetImplementationTypes, deeperSet, implementationTypeMap);
            }
        }
    }
}
exports.CommonTypesWriter = CommonTypesWriter;
const WITH_TYPE_NAME_DECLARATION = `
export type WithTypeName<T, TypeName extends string> =
    T extends {readonly __typename: string} ?
    T :
    T & {readonly __typename: TypeName};
;
`;
const IMPLEMENTATION_TYPE_COMMENT = `
/**
 * 
 * This 'ImplementationType' is used for inheritance, let's see an example, if graphql schema is:
 * 
 *     interface A {}
 *     interface B implements A {}
 *     type C implements B & A {}
 * 
 * Typescript code will be generated by like this:
 * 
 *     export ImplementationType<T extends string> =
 *         T extends 'A' ? 'A' | ImplementationType<'B'> :
 *         T extends 'B' ? 'B' | ImplementationType<'C'> :
 *         T
 *     ;
 * 
 * Let's see another example with abstract type, if the graphql schema is:
 * 
 *     union AbstractType = Impl1 | Imple2;
 *     type Impl1 {}
 *     type Impl2 {}
 * 
 * Typescript code will be generated by like this:
 * 
 *     export ImplementationType<T extends string> =
 *         T extends 'AbstractType' ? ImplemenationType<'Impl1'> | ImplementationType<'Impl2'> :
 *         T
 *     ;
 */
`;
/*
on<XName extends ImplementationType<'A'>, X extends object>(
    child: Fetcher<XName, X>
): AFetcher<
    XName extends 'A' ?
    T & X :
    WithTypeName<T, ImplementationType<'A'>> & (WithTypeName<X, ImplementationType<XName>> | {__typename: Exclude<ImplementationType<'A'>, ImplementationType<XName>>})
>;
*/ 