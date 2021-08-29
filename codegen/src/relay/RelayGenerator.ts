import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { join } from "path";
import { FetcherWriter } from "../FetcherWriter";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { InheritanceInfo } from "../InheritanceInfo";
import { RelayWriter } from "./RelayWriter";

export class RelayGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected createFetcheWriter(
        modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
        inheritanceInfo: InheritanceInfo,
        stream: WriteStream,
        config: GeneratorConfig
    ): FetcherWriter {
        return new FetcherWriter(
            true,
            modelType,
            inheritanceInfo,
            stream,
            config
        );
    }

    protected async generateServices(
        queryFields: GraphQLField<unknown, unknown>[],
        mutationsFields: GraphQLField<unknown, unknown>[],
        promises: Promise<void>[]
    ) {
        promises.push(this.generateRelayCode(queryFields));
    }

    private async generateRelayCode(queryFields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Relay.ts")
        );
        new RelayWriter(queryFields, stream, this.config).write();
        await awaitStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(EXPORT_RELAY_TYPES_CODE);
        stream.write(EXPORT_RELAY_VARS_CODE);
    }

    private writeBuildRefetchQuery(stream: WriteStream, queryFields: GraphQLField<unknown, unknown>[]) {


    }
}

const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryOf, 
    OperationOf, 
    QueryResponseOf, 
    QueryVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    OperationType,
    FragmentKeyType
} from "./Relay";\n`;

const EXPORT_RELAY_VARS_CODE = `export {
    RelayQuery, 
    RelayMutation, 
    RelayFragment, 
    createTypedQuery,
    createTypedMutation,
    createTypedFragment,
    createTypedOperationDescriptor,
    loadTypedQuery,
    useTypedQueryLoader,
    useTypedPreloadedQuery,
    useTypedLazyLoadQuery,
    useTypedMutation,
    useTypedFragment,
    useTypedRefetchableFragment
} from "./Relay";\n`;
