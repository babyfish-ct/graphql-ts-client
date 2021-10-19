import { GraphQLUnionType } from "graphql";
import { FetcherWriter } from "../FetcherWriter";

export class RelayFetcherWriter extends FetcherWriter {

    protected prepareImportings() {
        
        this.importStatement("import { FragmentRefs } from 'relay-runtime';");
        this.importStatement("import { TypedFragment } from 'graphql-ts-client-relay';");

        super.prepareImportings();
    }

    protected writeFragmentMethods() {

        super.writeFragmentMethods();

        const t = this.text.bind(this);

        t(`\non<XFragmentName extends string, XData extends object, XVariables extends object>`);
        this.scope({type: "PARAMETERS", multiLines: !(this.modelType instanceof GraphQLUnionType)}, () => {
            t(`child: TypedFragment<XFragmentName, "${this.modelType.name}", XData, XVariables>`);
        });
        t(`: ${this.fetcherTypeName}`);
        this.scope({type: "GENERIC", multiLines: true}, () => {
            t('T & ');
            this.scope({type: "BLOCK", multiLines: true}, () => {
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