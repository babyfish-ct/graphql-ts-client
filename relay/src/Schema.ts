import { Schema } from "relay-compiler";
import { Source } from 'graphql';

export function createSchema(schema: string): Schema {
    return (create as CreateFunc)(new Source(schema), undefined, schemaExtensions);
}

process.hrtime = require('browser-process-hrtime');

const { schemaExtensions } = require("relay-compiler/lib/core/RelayIRTransforms");
const { create } = require("relay-compiler/lib/core/Schema");

type CreateFunc = (source: Source, _: any, extensions: ReadonlyArray<string>) => Schema;
