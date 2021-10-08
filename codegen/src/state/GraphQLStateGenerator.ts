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
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { join } from "path";
import { FetcherContext } from "../FetcherContext";
import { closeStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { TriggerEventWiter } from "./TriggerEventWriter";
import { TypedConfigurationWriter } from "./TypedConfigurationWriter";

export class GraphQLStateGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(`export type { newTypedConfiguration } from "./TypedConfiguration";\n`);
        await super.writeIndexCode(stream, schema);
    }

    protected async generateServices(ctx: FetcherContext, promises: Promise<void>[]) {
        promises.push(this.generateTypedConfiguration(ctx));
        await this.mkdirIfNecessary("triggers");
        promises.push(this.generateTriggerEvents(ctx));
        promises.push(this.generateTriggerIndex(ctx));
    }

    private async generateTypedConfiguration(ctx: FetcherContext) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "TypedConfiguration.ts")
        );
        new TypedConfigurationWriter(ctx, stream, this.config).write();
        await closeStream(stream);
    }

    private async generateTriggerEvents(ctx: FetcherContext) {
        for (const fetcherType of ctx.fetcherTypes) {
            if (fetcherType.name === "Query" || fetcherType.name === "Mutation") {
                continue;
            }
            if (ctx.connectionTypes.has(fetcherType) || ctx.edgeTypes.has(fetcherType)) {
                continue;
            }
            if (fetcherType instanceof GraphQLObjectType || fetcherType instanceof GraphQLInterfaceType) {
                let idField: GraphQLField<any, any> | undefined = undefined;
                if (fetcherType.name !== "Query") {
                    idField = ctx.idFieldMap.get(fetcherType);
                    if (idField === undefined) {
                        throw new Error(`There is no id field in the type "${fetcherType.name}"`);
                    }
                }
                const dir = join(this.config.targetDir, "triggers");
                const stream = createStreamAndLog(join(dir, `${fetcherType.name}ChangeEvent.ts`));
                new TriggerEventWiter(
                    fetcherType, 
                    idField, 
                    stream, 
                    this.config
                ).write();
                await closeStream(stream);
            }
        }
    }

    private async generateTriggerIndex(ctx: FetcherContext) {
        const stream = createStreamAndLog(
            join(
                join(this.config.targetDir, "triggers"), 
                "index.ts"
            )
        );
        for (const fetcherType of ctx.fetcherTypes) {
            if (fetcherType.name === "Query" || 
            fetcherType.name === "Mutation" || 
            ctx.connectionTypes.has(fetcherType) || 
            ctx.edgeTypes.has(fetcherType)) {
                continue;
            }
            stream.write(`export type { ${fetcherType.name}ChangeEvent } from './${fetcherType.name}ChangeEvent';\n`);
        }
        await closeStream(stream);
    }
}
