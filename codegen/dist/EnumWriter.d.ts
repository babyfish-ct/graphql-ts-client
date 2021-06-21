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
import { GraphQLEnumType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class EnumWriter extends Writer {
    private readonly enumType;
    constructor(enumType: GraphQLEnumType, stream: WriteStream, config: GeneratorConfig);
    protected writeCode(): void;
}
