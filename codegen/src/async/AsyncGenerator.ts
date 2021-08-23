/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLField } from "graphql";
import { argsWrapperTypeName, AsyncOperationWriter } from "./AsyncOperationWriter";
import { AsyncEnvironmentWriter } from "./AsyncEnvironmentWriter";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { join } from "path";

export class AsyncGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected async generateServices(
        queryFields: GraphQLField<unknown, unknown>[],
        mutationFields: GraphQLField<unknown, unknown>[],
        promises: Promise<void>[]
    ) {
        promises.push(this.generateEnvironment());
        if (queryFields.length !== 0) {
            await this.mkdirIfNecessary("queries");
            promises.push(this.generateOperations(false, queryFields));
        }
        if (mutationFields.length !== 0) {
            await this.mkdirIfNecessary("mutations");
            promises.push(this.generateOperations(true, mutationFields));
        }
    }

    private async generateEnvironment() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Environment.ts")
        );
        new AsyncEnvironmentWriter(stream, this.config).write();
        await awaitStream(stream);
    }
    
    private async generateOperations(
        mutation: boolean,
        fields: GraphQLField<unknown, unknown>[]
    ) {
        const subDir = mutation ? "mutations" : "queries";
        const promises = fields.map(async field => {
            const stream = createStreamAndLog(
                join(this.config.targetDir, subDir, `${field.name}.ts`)
            );
            new AsyncOperationWriter(mutation, field, stream, this.config).write();
            await awaitStream(stream);
        });
        const writeIndex = async() => {
            const stream = createStreamAndLog(
                join(this.config.targetDir, subDir, "index.ts")
            );
            for (const field of fields) {
                stream.write(`export {${field.name}} from './${field.name}';\n`);
                const argsWrapperName = argsWrapperTypeName(field);
                if (argsWrapperName !== undefined) {
                    stream.write(`export type {${argsWrapperName}} from './${field.name}';\n`);
                }
            }
            stream.end();
        };
        await Promise.all([
            ...promises,
            writeIndex()
        ]);
    }
}