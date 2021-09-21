# Use with relay

Unlike the standard relay usage, there is no need to use babel-plugin-relay and relay-compiler. The purpose is to avoid executing the "yarn relay" command again and again.

## 1. Start

Create project

```
yarn create react-app <YourAppName> --template typescript

```
2. Enter the project directory and add dependencies

```
yarn add \
    react-relay @types/react-relay \
    relay-runtime @types/relay-runtime \
    graphql-ts-client-api \
    graphql-ts-client-relay

yarn add graphql-ts-client-codegen --dev
```

3. Prepare node script to generate code

Enter the project directory, create a new subdirectory named "scripts", and create a js file under it. The file name is arbitrary, and it is assumed to be GraphQLCodeGenerator.js here. The content of the file is as follows

```js
const {RelayGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new RelayGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    }
});
generator.generate();
```
4. Configure codegen command

Modify the package.json of the project, find the JSON object corresponding to the attribute named "scripts", and add a sub-attribute named "codegen"
```
"codegen": "node scripts/GraphQLCodeGenerator.js"
```
5. Generate client code

In the case of ensuring that the server is turned on, execute the following commands to produce client commands
```
yarn codegen
```
When the server interface remains unchanged, the client code only needs to be generated once. This is the essential difference from the "yarn relay" command.

## 2. Fetcher wrapper

Due to the particularity of the relay itself, the fetcher objects cannot be used directly, they must be wrapped as TypedQuery, TypedMutation, and TypedFragment.

In[src/__generated/Relay.ts](../example/client/relay-demo/src/__generated/Relay.ts), there are 3 functions for creating wrapper objects based on Fetcher.

1. createTypedQuery
2. createTypedMutation
3. createTypedFragment

For example

```ts
import { createTypedQuery, createTypedMutation, createTypedFragment } from './__generated';
import { 
    query$, 
    mutation$, 
    employeeConnection$, 
    employeeEdge$, 
    employee$$, 
    employee$, 
    department$ 
} from './__generated/fetchers';

export const EMPLOYEE_ASSOCIATION_FRAGEMNT = createTypedFragment(
    "EmployeeAssocaitionFragment",
    employee$
    .supervisor(
        employee$.id.firstName.lastName
    )
    .subordinates(
        employee$.id.firstName.lastName
    )
    .directive("refetchable", { queryName: "EmployeeAssocaitionFragmentRefetchQuery" })
);

export const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$$
                .on(EMPLOYEE_ASSOCIATION_FRAGEMNT)
            )
        )
    )
);

export const EMPLOYEE_MERGE_MUTATION = createTypedMutation(
    "EmployeeMergeMutation",
    mutation$.mergeEmployee(
        employee$$
        .department(
            department$.id
        )
        .supervisor(
            employee$.id
        )
    )
);
```

1. The wrapper objects created by these functions must be saved with global constants for reuse by other code.
2. Each wrapper object needs at least one name (such as "EmployeeAssocaitionFragment", "EmployeeAssocaitionFragmentRefetchQuery", "EmployeeListQuery" and "EmployeeMergeMutation" here). Please ensure that these names are unique. If there is a name conflict, it will cause a runtime exception.

These global objects can be used by other generated relay APIs, and the code generator will generate new API functions to replace the relay API functions

|Strongly typed API generated in src/__generated|relay API|
|----------|-------------|
|loadTypedQuery|loadQuery|
|fetchTypedQuery|fetchQuery|
|useTypedQueryLoader|useQueryLoader|
|useTypedPreloadedQuery|usePreloadedQuery|
|useTypedLazyQuery|useLazyQuery|
|useTypedMutation|useMutation|
|useTypedFragment|useFragment|
|useTypedRefetchableFragment|useRefetchableFragment|
|useTypedPaginationFragment|usePaginationFragment|

The usage of the new API and the relay API are the same, but there is one difference: the parameters of the relay API accept the GraphQLTaggedNode defined in the relay-runtime; the parameters of the new API accept the above wrapper objects.

## 3. Supporting demo

Due to the complexity of the relay, two demos are provided for relay.

### 3.1. relay-tutorial

Tutorial demonstration for query functions [example/client/relay-tutorial](../example/client/relay-tutorial)

1. Start server
```
cd example/server
yarn install
yarn start
```

2. Start client
```
cd example/client/relay-tutorial
yarn install
yarn start
```
Access http://localhost:3000

### 3.2. relay-demo

Complete functional demonstration [example/client/relay-demo](../example/client/relay-demo)

1. Start server
```
cd example/server
yarn install
yarn start
```

2. Start client
```
cd example/client/relay-demo
yarn install
yarn start
```
Access http://localhost:3000

----------------------

[Back to document home](./README.md) | [< Previous：Use with @apollo/client](./apollo.md)
