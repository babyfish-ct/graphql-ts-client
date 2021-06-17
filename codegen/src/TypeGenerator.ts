import { GraphQLNamedType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { createWriteStream } from "fs";
import { typeLocation } from "./TypeLocation";
import { ObjectTypeWriter } from "./ObjectTypeWriter";
import { mkdir, exists } from "fs";
import { promisify } from "util";
import { join } from "path";

export async function generateType(
    type: GraphQLNamedType,
    config: GeneratorConfig
) {
    const [dir, fileName] = typeLocation(type, config) ?? [];
    if (dir !== undefined) {
        if (!await existsAsync(dir)) {
            await mkdirAsync(dir);
        }
        const stream = createWriteStream(join(dir, fileName));
        if (type instanceof GraphQLObjectType) {
            new ObjectTypeWriter(
                type,
                stream,
                config
            ).write();
        }
        stream.end();
    }
}

const mkdirAsync = promisify(mkdir);
const existsAsync = promisify(exists);