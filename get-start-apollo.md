# Step-by-step guide with apollo/client


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
yarn add graphql @apollo/client graphql-ts-client-api
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
const {ApolloGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new ApolloGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    },
});
generator.generate();
```

> *Notes*
> ```
> defaultFetcherExcludeMap: {
>     "Department": ["avgSalary"]
> }
> ```
> Can only work with the server of the attached demo of this framework, if you are generating code for other servers, please delete it.

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
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useTypedQuery } from "./__generated";
import { department$, employee$, employeeConnection$, employeeEdge$, query$ } from "./__generated/fetchers";

const client = new ApolloClient({
    uri: "http://localhost:8080/graphql",
    cache: new InMemoryCache()
});

function App() {
    return (
        <ApolloProvider client={client}>
            <Example/>
        </ApolloProvider>
    );
}

function Example() {
    const { loading, error, data } = useTypedQuery(
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
```

### 7. Run your app(depends on server)

Goto the root dir of your app, execute 
```
yarn start
```
Now, you can access http://localhost:3000

This is the simplest demo, you can view the full demo [apollo-demo](example/client/apollo-demo) to know more

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)

