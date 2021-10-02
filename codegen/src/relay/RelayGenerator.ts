import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { join } from "path";
import { FetcherContext } from "../FetcherContext";
import { FetcherWriter } from "../FetcherWriter";
import { closeStream, createStreamAndLog, Generator } from "../Generator";
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
        connectionTypes: Set<GraphQLObjectType>,
        edgeTypes: Set<GraphQLObjectType>,
        stream: WriteStream,
        config: GeneratorConfig
    ): FetcherWriter {
        return new FetcherWriter(
            true,
            modelType,
            inheritanceInfo,
            connectionTypes,
            edgeTypes,
            stream,
            config
        );
    }

    protected async generateServices(
        ctx: FetcherContext,
        promises: Promise<void>[]
    ) {
        promises.push(this.generateRelayCode(ctx.schema));
    }

    async generateRelayCode(schema: GraphQLSchema) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Relay.ts")
        );
        new RelayWriter(schema, stream, this.config).write();
        await closeStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(EXPORT_RELAY_TYPES_CODE);
        stream.write(EXPORT_RELAY_CODE);
        await super.writeIndexCode(stream, schema);
    }
}

const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryOf, 
    OperationOf, 
    OperationResponseOf, 
    OperationVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    OperationType,
    FragmentKeyType
} from "./Relay";
`;

const EXPORT_RELAY_CODE = `export {
    createTypedQuery,
    createTypedMutation,
    createTypedFragment,
    loadTypedQuery,
    fetchTypedQuery,
    useTypedQueryLoader,
    useTypedPreloadedQuery,
    useTypedLazyLoadQuery,
    useTypedMutation,
    useTypedFragment,
    useTypedRefetchableFragment,
    useTypedPaginationFragment,
    getConnection,
    getConnectionID
} from './Relay';
`;
