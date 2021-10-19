"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayFetcherWriter = void 0;
const graphql_1 = require("graphql");
const FetcherWriter_1 = require("../FetcherWriter");
class RelayFetcherWriter extends FetcherWriter_1.FetcherWriter {
    prepareImportings() {
        this.importStatement("import { FragmentRefs } from 'relay-runtime';");
        this.importStatement("import { TypedFragment } from 'graphql-ts-client-relay';");
        super.prepareImportings();
    }
    writeFragmentMethods() {
        super.writeFragmentMethods();
        const t = this.text.bind(this);
        t(`\non<XFragmentName extends string, XData extends object, XVariables extends object>`);
        this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
            t(`child: TypedFragment<XFragmentName, "${this.modelType.name}", XData, XVariables>`);
        });
        t(`: ${this.fetcherTypeName}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t('T & ');
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t('readonly " $data": XData');
                this.separator(", ");
                t('readonly " $fragmentRefs": FragmentRefs<XFragmentName>');
            });
            this.separator(", ");
            t("TVariables & XVariables");
        });
        t(";\n");
    }
}
exports.RelayFetcherWriter = RelayFetcherWriter;
