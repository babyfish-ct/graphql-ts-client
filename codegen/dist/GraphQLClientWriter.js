"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLClientWriter = void 0;
const Writer_1 = require("./Writer");
class GraphQLClientWriter extends Writer_1.Writer {
    constructor(stream, config) {
        super(stream, config);
    }
    prepareImportings() {
        this.importStatement("import {GraphQLClient} from 'graphql-request';");
    }
    writeCode() {
        const t = this.text.bind(this);
        t(COMMENT);
        t("let client: GraphQLClient | undefined = undefined;\n");
        t("\n");
        t("export function graphQLClient(): GraphQLClient ");
        this.enter("BLOCK", true);
        t("const c = client;\n");
        t("if (c === undefined)");
        {
            this.enter("BLOCK", true);
            t("throw new Error(\"Can not invoke 'graphQLClient' because 'setGraphQLClient' has never been invocated\");");
            this.leave("\n");
        }
        t("return c;\n");
        this.leave("\n");
        t("\n");
        t("export function setGraphQLClient(c: GraphQLClient, overrideIfExists: boolean = false) ");
        this.enter("BLOCK", true);
        t("if (client !== undefined && !overrideIfExists)");
        {
            this.enter("BLOCK", true);
            t("throw new Error(\"'setGraphQLClient' cannot be invoked when the argument 'overrideIfExists' is false and it has been inovked yet.\");");
            this.leave("\n");
        }
        t("client = c;\n");
        this.leave("\n");
    }
}
exports.GraphQLClientWriter = GraphQLClientWriter;
const COMMENT = `
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
