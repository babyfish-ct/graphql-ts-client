import { FC, memo, Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Environment, Network, RecordSource, RequestParameters, Store, Variables } from 'relay-runtime';
import './App.css';
import { createTypedQuery, loadTypedQuery, PreloadedQueryOf, useTypedPreloadedQuery } from './__generated';
import { department$$, employee$, query$ } from './__generated/fetchers';

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

function App() {
    return (
        <RelayEnvironmentProvider environment={environment}>
            <Suspense fallback="Loading...">
                <Example queryReference={queryReference}/>
            </Suspense>
        </RelayEnvironmentProvider>
    );
}

const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$
    .findEmployees(
        employee$.id.firstName.lastName
        .department(
            department$$.id.name
        )
        .supervisor(
            employee$.id.firstName.lastName
        )
        .subordinates(
            employee$.id.firstName.lastName
        )
    )
)

const queryReference = loadTypedQuery(
    environment, 
    EMPLOYEE_LIST_QUERY,
    {}
);

const Example: FC<{
    queryReference: PreloadedQueryOf<typeof EMPLOYEE_LIST_QUERY>
}> = memo(({queryReference}) => {
    const data = useTypedPreloadedQuery(EMPLOYEE_LIST_QUERY, queryReference);
    return (
        <>
            {
                data.findEmployees.map(employee => 
                    <div key={employee.id} style={{border: "solid 1px gray", margin: "1rem"}}>
                        <div>Name: {employee.firstName} {employee.lastName}</div>
                        <div>Department: { employee.department.name} </div>
                        <div>
                            Supervisor: 
                            { 
                                employee.supervisor !== undefined ? 
                                `${employee.supervisor.firstName} ${employee.supervisor.lastName}` : 
                                'No supervisor' 
                            }
                        </div>
                        <div>
                            Suborinates: 
                            {
                                employee.subordinates.length !== 0 ?
                                <ul style={{margin: 0}}>
                                    {employee.subordinates.map(subordinate => 
                                        <li key={subordinate.id}>${subordinate.firstName} {subordinate.lastName}</li>
                                    )}
                                </ul> :
                                "No subordinates"
                            }
                        </div>
                    </div>
                )
            }
        </>
    );
});

export default App;
