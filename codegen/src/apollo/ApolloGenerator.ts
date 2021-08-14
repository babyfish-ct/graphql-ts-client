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
import { GraphQLField, GraphQLSchema } from "graphql";
import { join } from "path";
import { associatedTypeOf } from "../Associations";
import { createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { ApolloHookWriter } from "./ApolloHookWriter";

export class ApolloGenerator extends Generator {
    
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
    }

    private async generateQueries(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Queries.ts")
        );
        new ApolloHookWriter("Query", fields, stream, this.config).write();
        await stream.end();
    }

    private async generateMutations(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Mutations.ts")
        );
        new ApolloHookWriter("Mutation", fields, stream, this.config).write();
        await stream.end();
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        
        let hasTypedQuery = false;
        let hasSimpleQuery = false;
        let hasTypedMutation = false;
        let hasSimpleMutation = false;
        
        const queryFieldMap = schema.getQueryType()?.getFields();
        for (const queryFieldName in queryFieldMap) {
            const queryField = queryFieldMap[queryFieldName];
            if (associatedTypeOf(queryField.type) !== undefined) {
                hasTypedQuery = true;
            } else {
                hasSimpleQuery = true;
            }
            if (hasTypedQuery && hasSimpleQuery) {
                break;
            }
        }

        const mutationFieldMap = schema.getMutationType()?.getFields();
        for (const mutationFieldName in mutationFieldMap) {
            const mutationField = mutationFieldMap[mutationFieldName];
            if (associatedTypeOf(mutationField.type) !== undefined) {
                hasTypedMutation = true;
            } else {
                hasSimpleMutation = true;
            }
            if (hasTypedMutation && hasSimpleMutation) {
                break;
            }
        }

        if (hasTypedQuery || hasSimpleQuery) {
            const typedQuery = hasTypedQuery ? "useTypedQuery, useLazyTypedQuery" : "";
            const simpleQuery = hasSimpleQuery ? "useSimpleQuery, useLazySimpleQuery" : "";
            const separator = hasTypedQuery && hasSimpleQuery ? ", " : ""
            stream.write(`export {${typedQuery}${separator}${simpleQuery}} from './Queries';\n`);
        }
        if (hasTypedMutation || hasSimpleMutation) {
            const typedMuation = hasTypedMutation ? "useTypedMutation" : "";
            const simpleMuation = hasSimpleMutation ? "useSimpleMutation" : "";
            const separator = hasTypedMutation && hasSimpleMutation ? ", " : "";
            stream.write(`export {${typedMuation}${separator}${simpleMuation}} from './Mutations';\n`);
        }

        super.writeIndexCode(stream, schema);
    }
}