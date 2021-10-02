/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLSchema } from "graphql";
import { join } from "path";
import { FetcherContext } from "../FetcherContext";
import { closeStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { TypedConfigurationWriter } from "./TypedConfigurationWriter";

export class GraphStateGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected async generateServices(ctx: FetcherContext, promises: Promise<void>[]) {
        promises.push(this.generateAsync(ctx));
    }

    private async generateAsync(ctx: FetcherContext) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "TypedConfiguration.ts")
        );
        new TypedConfigurationWriter(ctx, stream, this.config).write();
        await closeStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(`export type { newTypedConfiguration } from "./TypedConfiguration";\n`);
        await super.writeIndexCode(stream, schema);
    }
}