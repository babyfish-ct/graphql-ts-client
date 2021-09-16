# Step-by-step guide with nothing


### 1. Start the server

Download this project, goto [example/server](example/server), execute
```
yarn install
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
yarn add graphql-ts-client-api
yarn add graphql-ts-client-codegen --dev
``` 
*Notes:*

*My npm libraries are 'graphql-ts-client-api' and 'graphql-ts-client-codegen'. There is another library named 'graphql-ts-client' in npm repository, but that's not my framework.*

### 4. config code generator

Goto the root dir or your app
```
mkdir scripts
cd scripts
touch GraphQLCodeGenerator.js
``` 
Open the new file and paste code
```js
const {AsyncGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new AsyncGenerator({
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

*This is a one-time job! Be different with code generator of other similar frameworks or the compiler of relay, you need not to generate code again and again.*

*After this step, you can forget the code generator until the server-side team tell you their interface has been changed.*

### 6. Change react code
Change 'src/App.tsx' of your app, copy & paste this code
```tsx
import { useCallback, useEffect, useState } from 'react';
import { ModelType } from 'graphql-ts-client-api';
import './App.css';
import { execute, setGraphQLExecutor } from './__generated';
import { department$, employee$, employeeConnection$, employeeEdge$, query$ } from './__generated/fetchers';

setGraphQLExecutor(async (request, variables) => {
    const response = await fetch('http://localhost:8080/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: request,
			variables,
		}),
	});
	return await response.json();
});

const EMPLOYEE_LIST_QUERY =
    query$
    .findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$.id.firstName.lastName
                .department(
                    department$.id.name
                )
                .supervisor(
                    employee$.id.firstName.lastName
                )
                .subordinates(
                    employee$.id.firstName.lastName
                )
            )
        )
    );

function App() {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ModelType<typeof EMPLOYEE_LIST_QUERY>>();
    const [error, setError] = useState<Error>();

    const findEmployees = useCallback(async () => {
        setLoading(true);
        setData(undefined);
        setError(undefined);
        try {
            const data = await execute(EMPLOYEE_LIST_QUERY);
            setData(data);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        findEmployees();
    }, [findEmployees]);

    return (
        <>
            { error && <div>Error</div> }
            { loading && <div>Loading...</div> }
            {
                data?.findEmployees.edges.map(edge => { 
                    const employee = edge.node;
                    return (
                        <div key={employee.id} style={{border: "solid 1px gray", margin: "1rem"}}>
                            <div>Name: {employee.firstName} {employee.lastName}</div>
                            <div>Department: { employee.department.name} </div>
                            <div>
                                Supervisor: 
                                { 
                                    employee.supervisor !== undefined ? 
                                    `${employee.supervisor.firstName} ${employee.supervisor.lastName}` : 
                                    <span style={{fontStyle: "italic", color: "gray"}}>No supervisor</span>
                                }
                            </div>
                            <div>
                                Suborinates: 
                                {
                                    employee.subordinates.length !== 0 ?
                                    <ul style={{margin: 0}}>
                                        {employee.subordinates.map(subordinate => 
                                            <li key={subordinate.id}>{subordinate.firstName} {subordinate.lastName}</li>
                                        )}
                                    </ul> :
                                    <span style={{fontStyle: "italic", color: "gray"}}>No subordinates</span>
                                }
                            </div>
                        </div>
                    );
                })
            }
        </>
    );
}

export default App;
```

### 7. Run your app(depends on server)

Goto the root dir of your app, execute 
```
yarn start
```

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)

