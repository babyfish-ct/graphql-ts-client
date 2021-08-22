import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { associatedTypeOf } from "../Associations";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";

export class RelayHookWriter extends Writer {

    protected readonly hasTypedHooks: boolean;

    protected readonly hasSimpleHooks: boolean;

    constructor(
        private hookType: "Query" | "Mutation",
        private fields: GraphQLField<unknown, unknown>[],
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.hasTypedHooks = this.fields.find(field => associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => associatedTypeOf(field.type) === undefined) !== undefined;
    }

    protected writeCode() {

    }
}