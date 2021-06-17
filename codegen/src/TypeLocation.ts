import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { join } from "path";
import { DEFAULT_FETCHER_SUBFFIX } from "./FetcherWriter";

export function typeLocation(
    type: GraphQLNamedType,
    config: GeneratorConfig
): [string, string] | undefined {
    if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
        return [
            join(config.targetDir, "fetchers"),
            `${type.name}${config.fetcherSuffix ?? DEFAULT_FETCHER_SUBFFIX}.ts`
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