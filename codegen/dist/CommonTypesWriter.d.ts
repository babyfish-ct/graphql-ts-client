/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { InheritanceInfo } from "./InheritanceInfo";
import { Writer } from "./Writer";
export declare class CommonTypesWriter extends Writer {
    private schema;
    private inheritanceInfo;
    constructor(schema: GraphQLSchema, inheritanceInfo: InheritanceInfo, stream: WriteStream, config: GeneratorConfig);
    protected writeCode(): void;
    private writeWithTypeNameType;
    private writeImplementionType;
    private writeCastMethod;
}
