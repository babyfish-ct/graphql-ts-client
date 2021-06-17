import { buildSchema, GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { mkdir, rmdir, exists } from "fs";
import { promisify } from "util";
import { generateType } from "./TypeGenerator";

export class Generator {

    constructor(private config: GeneratorConfig) {
    }

    async generate() {
        const schema = await this.parseSchema();
        await this.recreateTargetDir();
        const queryType = schema.getQueryType();
        const mutationType = schema.getMutationType();
        const typeMap = schema.getTypeMap();
        for (const typeName in typeMap) {
            if (!typeName.startsWith("__")) {
                const type = typeMap[typeName]!;
                if (type !== queryType && type !== mutationType) {
                    generateType(type, this.config);
                }
            }
        }
    }

    private async parseSchema(): Promise<GraphQLSchema> {
        
        let schemaDefinition: string; 
        try {
            schemaDefinition = await this.config.schemaExtractor(); 
            console.log("Get graphql graphql schema definition successfully");
            console.log(schemaDefinition);
        } catch (ex) {
            console.error("Cannot get graphql schema definition");
            throw ex;
        }

        try {
            return buildSchema(schemaDefinition);
        } catch (ex) {
            console.error("Failed to parse graphql schema");
            throw ex;
        }
    }

    private async recreateTargetDir() {
        console.log(this.config.targetDir);
        if (this.config.recreateTargetDir && await existsAsync(this.config.targetDir)) {
            try {
                rmdirAsync(this.config.targetDir);
            } catch (ex) {
                console.error(`'recreateTargetDir' is configured to be true but failed to remove target directory "${this.config.targetDir}"`);
                throw ex;
            }
        }
        if (!await existsAsync(this.config.targetDir)) {
            try {
                mkdirAsync(this.config.targetDir);
            } catch (ex) {
                console.error(`Failed to create target directory "${this.config.targetDir}"`);
                throw ex;
            }
        }
    }
}

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const existsAsync = promisify(exists);