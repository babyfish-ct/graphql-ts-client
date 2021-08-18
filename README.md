'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:

1. Supports GraphQL queries with strongly typed code.
2. **Automatically infers the type of the returned data according to the strongly typed query request**, This is the essential difference between this framework and other similar frameworks, and it is also the reason why I created it.


![ImageText](graphql-ts-client.gif)


# Get started

In order to support 'OUT-OF-THE-BOX', this framework is integrated with @apollo/client since 2.1.4, let's use it step by step :)

### 1. Start the server

Goto [example/server](example/server), execute
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

*This is a one-time job! Be different with code generator of other similar frameworks or the compiler of relay, you need not to genrate code again and again.*

*After this step, you can forget the code generator until the server-side team tell you their interface has been changed.*

### 6. Change react code
Change 'src/App.tsx' of your app, like this
```tsx
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useTypedQuery } from "./__generated";
import { department$, employee$ } from "./__generated/fetchers";

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
        "findEmployees", 
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
    );
    return (
        <ApolloProvider client={client}>
            { error && <div>Error</div> }
            { loading && <div>Loading...</div> }
            {
                data &&
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
        </ApolloProvider>
    );
}

export default App;

```

### 7. Run your app(depends on server)

Goto the root dir of your app, execute 
```
yarn start
```
Now, you can access http://localhost:3000

This is the simplest demo, you can view the full demo [apollo-demo](example/client/apollo-demo) to know more

# MoreLinks

1. [Run the example](example/README.md)
2. [Code generator configuration](codegen-properties.md)
3. [Get inferred type explicitly](model-type.md)
4. [Polymorphism query & Fragment since 2.0.0](2.0.0.md)
5. [@apollo/client integration since 2.1.4](/example/client/apollo-demo/README.md)

# TODO items

1. Support directives
2. Integrate relay

# Contact me
Babyfish.ct@gmail.com
