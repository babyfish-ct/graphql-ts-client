import {GraphQLClient} from 'graphql-request';


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
let client: GraphQLClient | undefined = undefined;

export function graphQLClient(): GraphQLClient {
	const c = client;
	if (c === undefined){
		throw new Error("Can not invoke 'graphQLClient' because 'setGraphQLClient' has never been invocated");
	}
	return c;
}

export function setGraphQLClient(c: GraphQLClient, overrideIfExists: boolean = false) {
	if (client !== undefined && !overrideIfExists){
		throw new Error("'setGraphQLClient' cannot be invoked when the argument 'overrideIfExists' is false and it has been inovked yet.");
	}
	client = c;
}
