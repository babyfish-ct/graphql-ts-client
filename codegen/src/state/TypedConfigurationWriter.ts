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
import { GraphQLUnionType } from "graphql";
import { FetcherContext } from "../FetcherContext";
import { GeneratorConfig } from "../GeneratorConfig";
import { instancePrefix } from "../Utils";
import { Writer } from "../Writer";

export class TypedConfigurationWriter extends Writer {

    constructor(
        private ctx: FetcherContext,
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    protected isUnderGlobalDir(): boolean {
        return true;
    }

    protected prepareImportings() {
        this.importStatement(`import { newConfiguration } from 'graph-state';`);
        for (const fetfherType of this.ctx.fetcherTypes) {
            this.importStatement(`import { ${instancePrefix(fetfherType.name)}$ } from './fetchers';`);
            if (!this.ctx.connectionTypes.has(fetfherType) && !this.ctx.edgeTypes.has(fetfherType)) {
                this.importStatement(`import { ${fetfherType.name}ChangeEvent } from './triggers';`);
            }
        }
    }

    protected writeCode() {
        const t = this.text.bind(this);
        t("export function newTypedConfiguration() ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            t("return newConfiguration()");
            this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
                for (const fetcherType of this.ctx.fetcherTypes) {
                    t(`.addObjectFetcher(${instancePrefix(fetcherType.name)}$)`);
                }
            });
        });
        this.writeSchema();
    }

    private writeSchema() {
        const t = this.text.bind(this);
        t("export interface Schema ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const fetcherType of this.ctx.fetcherTypes) {
                if (fetcherType.name === "Mutation" || 
                fetcherType instanceof GraphQLUnionType ||
                this.ctx.connectionTypes.has(fetcherType) ||
                this.ctx.edgeTypes.has(fetcherType)) {
                    continue;
                }
                t(`readonly "${fetcherType.name}": `);
                this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                    const idField = this.ctx.idFieldMap.get(fetcherType);
                    if (idField !== undefined) {
                        t(`readonly " $id": `);
                        this.typeRef(idField.type);
                        t(";\n");
                    }
                    t(`readonly " $event": ${fetcherType.name}ChangeEvent`);
                })
            }
        });
    }
}