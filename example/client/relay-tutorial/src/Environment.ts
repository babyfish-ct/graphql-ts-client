import { Environment, Network, RecordSource, RequestParameters, Store, Variables } from 'relay-runtime';

export const environment = new Environment({
    network: Network.create(async (params: RequestParameters, variables: Variables) => {
        console.log(`fetching query ${params.name} with ${JSON.stringify(variables)}`);
        const response = await fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: params.text,
                variables,
            }),
        }); 
        return await response.json()
    }),
    store: new Store(new RecordSource()),
});
