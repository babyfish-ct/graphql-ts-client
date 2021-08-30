# Step-by-step guide with relay


### 1. Start the server

Download this project, goto [example/server](example/server), execute
```
yarn start
```

### 2. Create your client app

Choose any another dir, execute
```
yarn create react-app <YourAppName> --template typescript
```

### 3. Add dendpenceis

Goto the root dir of your app, execute
```
yarn add react-relay relay-runtime @types/react-relay @types/relay-runtime graphql-ts-client-api
yarn add graphql-ts-client-codegen --dev
``` 
*Notes:*

*1. relay-compiler & babel-plugin-relay are unnecessary, don't add them. Be different with relay-compiler, generating code by graphql-ts-client-codegen is one-time work!*

*2. My npm libraries are 'graphql-ts-client-api' and 'graphql-ts-client-codegen'. There is another library named 'graphql-ts-client' in npm repository, but that's not my framework.*

### 4. config code generator

Goto the root dir or your app
```
mkdir scripts
cd scripts
touch GraphQLCodeGenerator.js
``` 
Open the new file and paste code
```js
const {RelayGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new RelayGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    recreateTargetDir: true,
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    },
});
generator.generate();
```
Open the package.json of the root dir, find the object "scripts" and add this field into it
```
"codegen": "node scripts/GraphQLCodeGenerator.js"
```

### 5. Generate TS code(depends on server)

Goto the root dir of your app, execute

```
yarn codegen
``` 
*Notes:*

*This is a one-time job! Be different relay-compiler, you need not to generate code again and again.*

*After this step, you can forget the code generator until the server-side team tell you their interface has been changed.*

### 6. Change react code
Change 'src/App.tsx' of your app, copy & paste this code
```tsx
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
```

### 7. Run your app(depends on server)

Goto the root dir of your app, execute 
```
yarn start
```

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)

