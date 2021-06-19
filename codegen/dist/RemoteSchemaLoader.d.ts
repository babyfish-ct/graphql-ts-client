import { GraphQLSchema } from 'graphql';
export declare function loadRemoteSchema(endpoint: string, headers?: {
    [key: string]: string;
}): Promise<GraphQLSchema>;
