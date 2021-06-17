import { GraphQLEnumType, GraphQLInputObjectType, GraphQLNamedType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { join } from "path";

export function typeLocation(
    type: GraphQLNamedType,
    config: GeneratorConfig
): [string, string] | undefined {
    if (type instanceof GraphQLObjectType) {
        return [
            join(config.targetDir, "objects"),
            `${type.name}Fetcher.ts`
        ];
    }
    if (type instanceof GraphQLEnumType) {
        return [
            join(config.targetDir, "enums"),
            `${type.name}.ts`
        ];
    }
    if (type instanceof GraphQLInputObjectType) {
        return [
            join(config.targetDir, "inputs"),
            `${type.name}.ts`
        ];
    }
    return undefined;
}