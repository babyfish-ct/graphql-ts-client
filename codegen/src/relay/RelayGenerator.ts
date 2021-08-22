import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { join } from "path";
import { FetcherWriter } from "../FetcherWriter";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { InheritanceInfo } from "../InheritanceInfo";
import { RelayHookWriter } from "./RelayHookWriter";

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
        mutationFields: GraphQLField<unknown, unknown>[],
        promises: Promise<void>[]
    ) {
        if (queryFields.length !== 0) {
            promises.push(this.generateQueries(queryFields));
        }
        if (mutationFields.length !== 0) {
            promises.push(this.generateMutations(mutationFields));
        }
        promises.push(this.generateRelayFragment());
    }

    private async generateQueries(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Queries.ts")
        );
        new RelayHookWriter("Query", fields, stream, this.config).write();
        awaitStream(stream);
    }

    private async generateMutations(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Mutations.ts")
        );
        new RelayHookWriter("Mutation", fields, stream, this.config).write();
        await awaitStream(stream);
    }

    private async generateRelayFragment() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "RelayFragment.tsx")
        );
        stream.write(RELAY_FRAGMENT_CODE);
        await awaitStream(stream);
    }
}

const RELAY_FRAGMENT_CODE = `
import { Fetcher, FragmentWrapper } from "graphql-ts-client-api";
import { GraphQLTaggedNode, graphql } from "relay-runtime";

/*
 * Example:
 *
 * export const DEPARTMENT_FRAGMENT =
 *     department$
 *     .id
 *     .name
 *     .employees(
 *         employee$
 *         .id
 *         .firstName
 *         .lastName
 *     )
 *     .toRelayFragment("DepartmentItem_item");
 */

export class RelayFragment<TFragmentName extends string, E extends string, T extends object> extends FragmentWrapper<TFragmentName, E, T>  {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<E, object>
    ) {
        super(name, fetcher);
        if (RELAY_FRAGMENT_MAP.has(name)) {
            throw new Error(
                \`The relay fragment '\${name} is aleary exists, please make sure: 
                "1. Each relay fragment is declared as constant under GLOBAL scope
                "2. Each relay fragment has a unique name\`
            );
        }
        const relayFragment = new RelayFragment<TFragmentName, E, T>(name, fetcher);
        RELAY_FRAGMENT_MAP.set(name, relayFragment);
        this.taggedNode = graphql(\`fragment \${name} \${fetcher.toString()}\`);
    }
}

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object>>();`;