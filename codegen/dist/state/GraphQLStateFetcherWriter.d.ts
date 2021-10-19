import { GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { FetcherWriter } from "../FetcherWriter";
export declare class GraphQLStateFetcherWriter extends FetcherWriter {
    protected importedNamesForSuperType(superType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType): string[];
    protected writeCode(): void;
    private writeScalarType;
    private writeFlatType;
}
