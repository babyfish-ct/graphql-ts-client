import { GraphQLField } from "graphql";
import { join } from "path";
import { createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { RelayHookWriter } from "./RelayHookWriter";

export class RelayWriter extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
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
        await stream.end();
    }

    private async generateMutations(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Mutations.ts")
        );
        new RelayHookWriter("Mutation", fields, stream, this.config).write();
        await stream.end();
    }

    private async generateRelayFragment() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "RelayFragment.tsx")
        );
        stream.write(RELAY_FRAGMENT_CODE);
        await stream.end();
    }
}

const RELAY_FRAGMENT_CODE = `
import { Fetcher } from "./Fetcher";

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

export class RelayFragment<E extends string, T extends object>  {

    private constructor(
        readonly fragmentName: string, 
        readonly fetcher: Fetcher<E, object>
    ) {
    }

    static create<E extends string, T extends object>(
        fragmentName: string, fetcher: Fetcher<E, T>
    ): RelayFragment<E, T> {

        if (RELAY_FRAGMENT_MAP.has(fragmentName)) {
            throw new Error(
                \`The relay fragment '\${fragmentName} is aleary exists, please make sure: \n'\` +
                "1. each relay fragment is declared as constant under GLOBAL scope\n" +
                "2. each relay fragment has a unique name"
            );
        }
        const relayFragment = new RelayFragment<E, T>(fragmentName, fetcher);
        RELAY_FRAGMENT_MAP.set(fragmentName, relayFragment);
        return relayFragment;
    }
}

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, object>>();`;