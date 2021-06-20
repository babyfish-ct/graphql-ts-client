import { WriteStream } from "fs";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class GraphQLClientWriter extends Writer {

    constructor(stream: WriteStream, config: GeneratorConfig) {
        super(stream, config);
    }

    protected prepareImportings() {
        this.importStatement("import {GraphQLClient} from 'graphql-request';");
    }

    protected writeCode() {
        const t = this.text.bind(this);
        
        t(COMMENT);
        
        t("let client: GraphQLClient | undefined = undefined;\n");
        t("\n");

        t("export function graphQLClient(): GraphQLClient ");
        this.enter("BLOCK", true);
        t("const c = client;\n");
        t("if (c === undefined) "); 
        {
            this.enter("BLOCK", true);
            t(`const message = "${NO_CLIENT}";\n`);
            t("throw console.error(message);\n");
            t("throw new Error(message);\n");
            this.leave("\n");
        }
        t("return c;\n");
        this.leave("\n");

        t("\n");
        
        t("export function setGraphQLClient(c: GraphQLClient, overrideIfExists: boolean = false) ");
        this.enter("BLOCK", true);
        t("if (client !== undefined && !overrideIfExists) "); 
        {
            this.enter("BLOCK", true);
            t(`const message = "${EXISTS_CLIENT}";\n`);
            t("throw console.error(message);\n");
            t("throw new Error(message);\n");
            this.leave("\n");
        }
        t("client = c;\n");
        this.leave("\n");
    }
}

const COMMENT =
`
/*
 * 1. Control the version of 'graphql-request' by your self.
 * 
 * This framework does not contain the dedendency for 'graphql-request',
 * You need to execute 'yarn add graphql-request' by yourself.
 * 
 * 
 * 
 * 
 * 2. Why does this framework choose 'graphql-request'?
 * 
 * 'graphql-request' is "MIMIMAL" implementation 
 * with nothing except HTTP accessing and data parsing.
 * 
 * But 'graphql-request' looks like too simple,
 * how to support the remoting access status such as "loading" and "error"?
 * 
 * You can choose some powrful state mengement framework to resolve this problem,
 * use powerful state mengement framework to wrap the functions under './queries' and './mutations',
 * this is better than use some http-client framework with simple state managment functionalities.
 * 
 * Two powerful solutations are suggestioned:
 * 
 * 1. recoil(https://github.com/facebookexperimental/Recoil)
 * 2. react-query(https://github.com/tannerlinsley/react-query)
 */
`;

const NO_CLIENT = "Cannot invoke 'graphQLClient' because 'setGraphQLClient' has never been invoked";
const EXISTS_CLIENT = "'setGraphQLClient' cannot be invoked when the argument 'overrideIfExists' is false and it has been inovked yet.";