import { GraphQLNamedType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
export declare function generateType(type: GraphQLNamedType, config: GeneratorConfig): Promise<void>;
