import { WriteStream } from "fs";
import { GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class ObjectTypeWriter extends Writer {
    
    constructor(
        private objectType: GraphQLObjectType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    write() {
        
        const t = this.text.bind(this);

        t("import { Fetcher } from 'graphql-client';\n\n");

        t("export interface ");
        t(this.objectType.name);
        t("Fetcher<T> extends Fetcher<T> ");
        this.enter("BODY")
        t("\n");
        this.leave();
        t("\n");
    }
}
