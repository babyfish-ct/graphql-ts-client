# Step-by-step guide


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
yarn add graphql-state graphql-ts-client-api
yarn add graphql-ts-client-codegen --dev
``` 

### 4. config code generator

Goto the root dir or your app
```
mkdir scripts
cd scripts
touch GraphQLCodeGenerator.js
``` 
Open the new file and paste code
```js
const {GraphQLStateGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new GraphQLStateGenerator({
    schemaLoader: async() => {
        return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated")
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

*This is a one-time job! you need not to generate code again and again.*

*After this step, you can forget the code generator until the server-side team tell you their interface has been changed.*

### 6. Change react code

Change 'src/App.tsx' of your app, copy & paste this code
```tsx
import { Suspense } from 'react';
import { useQuery, StateManager, StateManagerProvider, GraphQLNetwork } from 'graphql-state';
import { newTypedConfiguration, Schema } from './__generated';
import { query$, employeeConnection$, employeeEdge$, employee$, department$ } from './__generated/fetchers';

function createStateManager(): StateManager<Schema> {
    return newTypedConfiguration()
        .network(
            new GraphQLNetwork(async(body, variables) => {
                const response = await fetch('http://localhost:8080/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: body,
                        variables,
                    }),
                }); 
                return await response.json();
            })
        )
        .buildStateManager()
    ;
}
    
function DepartmentList() {

    const data = useQuery(
        query$.findEmployees(
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
        )
    );
    
    return (
        <>
            {
                data.findEmployees.edges.map(edge => { 
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

function App() {

    const stateManager = createStateManager();
    return (
      <StateManagerProvider stateManager={stateManager}>
          <Suspense fallback={<div>Loading...</div>}>
              <DepartmentList/>
          </Suspense>
      </StateManagerProvider>
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

[Back to home](https://github.com/babyfish-ct/graphql-state)

