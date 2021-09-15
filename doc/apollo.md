# Use with @apollo/client

## 1. Start

1. Create project

```
yarn create react-app <YourAppName> --template typescript

```
2. Enter the project directory and add dependencies

```
yarn add \
    graphql \
    @apollo/client \
    graphql-ts-client-api

yarn add graphql-ts-client-codegen --dev
```

3. Prepare node script to generate code

Enter the project directory, create a new subdirectory named "scripts", and create a js file under it. The file name is arbitrary, and it is assumed to be GraphQLCodeGenerator.js here. The content of the file is as follows

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
When the server interface remains unchanged, the client code only needs to be generated once.



## 2. OperationName

In[src/__generated/Apollo.ts](../example/client/apollo-demo/src/__generated/Apollo.ts)，there are some react hook API functions used to replace @apollo/cient's hook API

|Strongly typed API generated in src/__generated|@apollo/client API|
|----------|-------------|
|useTypedQuery|useQuery|
|useTypedLazyQuery|useLazyQuery|
|useTypedMutation|useMuation|

The usage of the new API is the same as the @apollo/client API, but there is one difference: the parameters of the @apollo/client API accept the DocumentNode defined in graphql; and the parameters of the new API accept Fetcher. 

For example

```tsx
import { FC, memo } from "react";
import { useTypedQuery } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

export const SimpleList: FC = memo(() => {
    
    const { data, loading, error } = useTypedQuery(
        query$.findEmployees(
            employeeConnection$.edges(
                employeeEdge$.node(
                    employee$$
                )
            )
        ),
        { variables: {first: 100} }
    );

    return (
        <>
            { loading && <div style={{color: "green"}}>Loading...</div>}
            { error && <div style={{color: "red"}}>Error</div> }
            {
                data?.findEmployees?.edges?.map(edge =>
                    <div key={edge.node.id}>
                        FirstName {edge.node.firstName} |
                        LastName {edge.node.lastName} |
                        Gender {edge.node.gender} |
                        Salary {edge.node.salary}
                    </div>
                )
            }
        </>
    );
});
```
After this react component is rendered, the GraphQL request actually sent is as follows
```
query query_38ff4e765cd0dc01544cc9708c6dc7e7(
  $before: String, 
  $last: Int, 
  $after: String, 
  $first: Int, 
  $mockedErrorProbability: Int, 
  $supervisorId: 
  String, 
  $departmentId: String, 
  $name: String
) {
  findEmployees(
    before: $before
    last: $last
    after: $after
    first: $first
    mockedErrorProbability: $mockedErrorProbability
    supervisorId: $supervisorId
    departmentId: $departmentId
    name: $name
  ) {
    edges {
      node {
        id
        firstName
        lastName
        gender
        salary
        __typename
      }
      __typename
    }
    __typename
  }
}
```
And the attached variables are
```
{ first: 100 }
```

It is worth noting that the operationName of this request is "query_38ff4e765cd0dc01544cc9708c6dc7e7", where "38ff4e765cd0dc01544cc9708c6dc7e7" is the MD5 code of the fetcher object information.

In @apollo/client, the operationName of the query operation is very important. "useMutation" can specify some operationNames through a parameter called "refetchQueries". The queries corresponding to these operationNames will be automatically refreshed after the mutation is completed.

In this framework, in order to simplify the refresh work of queries, a dependency manager (explained later) is provided. The dependency manager can automatically refresh affected queries after the mutation is completed, without the developer's distraction. In this case, the operationNames will not be referenced by the developer in the code, so the readability is no longer important, as long as the uniqueness is guaranteed, the md5 code is used to automatically generate the operationNames to guarantee the uniqueness.

If the developer needs to use the classic method of @apollo/client to refresh the queries after the mutation, that means operationNames need to be referenced by the user code. At this time, you can specify the operationName explicitly, as follows

```ts
const { data, loading, error } = useTypedQuery(
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$$
            )
        )
    ),
    { 
        variables: {first: 100},

        // operationName is explicitly specified here, md5 is no longer generated
        operationName: "MyQueryOperationName" 
    }
);

```

Compared with the Hook API of @apollo/client, the options parameter has an optional configuration named "operationName", operationName can specified explicitly instead of the default md5 encoding.

Notice

1. If the operationName is explicitly specified, then as with the classic @apollo/client development, you must ensure the uniqueness of the operationNames for all queries.
2. Even if the operationName is speicified explicitly, the query can still be managed by the dependency manager.

## 3. DependencyManager

The dependency manager is used to reduce the difficulty of implementing the refetchQueries callback in "useMutation". It is optional and you can choose to use it or not

*Note: If you use the dependency manager, you do not need to specify the operationName for the query; otherwise, like the classic @apollo/client application, the operationNames of quires must be manually speicified and their uniqueness must be guaranteed*

The dependency manager maintains some global states
1. When the react component that contains the query is mounted, the operation name and the object dependency graph covered by its fetcher will be registered into dependency manager.
2. When the react component that contains the query is unmounted, the operation name and the object dependency graph covered by  its fetcher will be unregistered from dependency manager.

Therefore, the dependency manager understands the object dependency graph of any active query in the entire application.

Before executing mutaion, the client holds the old object; after executing the mutation operation, the server returns the new object. The dependency manager will recursively compare the old and new objects, trying to find whether any root objects or the associated references is created or deleted. If so, all the queries that have an intersection with the created/delete object type are judged to need to be refreshed.

The dependency manager only pays attention to the creation and deletion of the root objects and associated references, and does not care about the changes in the internal data of the objects, because the changes in the non-associated data within the objects can be properly handled by Apollo Cache.

### 3.1. Implant dependency manager

The generated source file[src/__generated/DependencyManagerProvider.tsx](../example/client/apollo-demo/src/__generated/DependencyManager.tsx) supports a react component&lt;DependencyManagerProvider/&gt;, use it in App.tsx

```tsx
import { DependencyManagerProvider } from './__generated';

<ApolloProvider client={client}>
    <DependencyManagerProvider defaultRegisterDependencies={true}>
        ...more elements...
    </DependencyManagerProvider>
</ApolloProvider>
```
"defaultRegisterDependencies" is a boolean property, its default value is true. In order to demonstrate more clearly, explicitly specify it here.

### 3.2. Register the query into dependency manager
```ts
const { loading, error, data } = useTypedQuery(
    query$.findDepartmentsLikeName(
        departmentConnection$.edges(
            departmentEdge$.node(
                department$$
                .employees(employee$$)
            )
        )
    ),
    { registerDependencies: true }
);
```
Compared with the Hook API of @apollo/client, the options parameter has an optional registerDependencies attribute. If this attribute is set, it means that when the current react component is mounted, the operation name and the object dependency graph covered by the fetcher should be registered in the dependency manager, these information will be unregistered from the dependency manager when the react component is unmounted.

In fact, if the "defaultRegisterDependencies" of &lt;DependencyManagerProvider/&gt; is true, the "registerDependencies" attribute need not be given here, such as
```ts
const { loading, error, data } = useTypedQuery(
    query$.findDepartmentsLikeName(
        departmentConnection$.edges(
            departmentEdge$.node(
                department$$
                .employees(employee$$)
            )
        )
    )
);
```
As you can see, there seems to be no change.

The fetcher of this query covers two types of objects, Department and Employee. When any of the following occurs, the query will be automatically refreshed

1. Department is inserted into the database as root object
2. Employee is inserted into the database as root object
3. Department is deleted from the database as root object
4. Employee is deleted from the database as root object
5. In the database, the foreign key of the existing Employee object pointing to the Department is modified (Foreign key modification = Deleting from the employees collection of the old Departmentmnt object + Inserting into the employees collection of the new Department object. So association modification is essentially also insertion and deletion)

Again, the dependency manager will not pay attention to the modification of non-associated fields. Because Apollo Cache can already handle this situation properly.

### 3.3 Refresh queries after the mutation

```tsx

import { ModelType } from "graphql-ts-client-api";
import { FC, memo, useCallback, useState } from "react";
import { useTypedMutation, useDependencyManager } from "./__generated";
import { department$, employee$, employee$$, mutation$ } from "./__generated/fetchers";
import { EmployeeInput } from "./__generated/inputs";

const EMPLOYEE_MERGE_FETCHER = // [:1]
    employee$$
    .department(department$.id)
    .supervisor(employee$.id)
;

export const Editor: FC<{
    oldEmployee?: ModelType<typeof EMPLOYEE_MERGE_INFO> // [:2]
}> = memo(({oldEmployee}) => {
    
    const [input, setInput] = useState(toInput(oldEmployee));

    const dependencyManager = useDependencyManager();

    const [mutate, {loading, error }] = useTypedMutation(
        mutation$.mergeEmployee(
            EMPLOYEE_MERGE_FETCHER
        ),
        {
            variables: { input },
            refetchQueries: result => {
                
                if (result.errors) { 
                    return dependencyManager.allResources(EMPLOYEE_MERGE_INFO); // [:3]
                }

                const newEmployee = result.data?.mergeEmployee;
                return dependencyManager.resources( // [:4]
                    EMPLOYEE_MERGE_INFO,
                    oldEmployee,
                    newEmployee
                );
            }
        }
    );

    const onSaveClick = useCallback(() => {
        mutate();        
    }, [mutate]);

    return (
        <>
            {
               /* 
                * TODO: Add form UI, call "setInput" to modify temporary data 
                */
            }
            <button 
            disabled={loading}
            onClick={onSaveClick}>
                {loading ? "Saving" : "Save"}
            </button>
            { error && <div style={{color: "red"}}>Save failed</div> }
        </>
    );
});

function toInput(oldEmployee?: ModelType<typeof EMPLOYEE_MERGE_INFO>): EmployeeInput {
    Fake code
     If oldEmployee is undefined (new): construct the initial input
     Otherwise (edit), convert oldEmployee to input
}

```

There are 4 comment marks in the code, and their explanations are as follows

1. For this mutation operation, the modification logic to be performed by the server includes all non-associated fields and two foreign keys. In fact, this is the table structure of Employee in the server database.
2. The oldEmployee parameter is optional. Not specified means new creation, specified means editing.
3. For exception, it may be network communication exception. In this case, it is actually unknown whether the server action has been executed. In actual projects, you should distinguish the type of anomaly to determine whether the queries needs to be refreshed; here, in order to simplify the document, a simple and rude way is used, indiscriminately, all queries that overlap with the fetcher query range are forcibly refreshed.
4. If the mutation is executed successfully, compare the old object and new object to determine which queries should be refreshed.


## 4. Business computing dependencies

As discussed above, the dependency manager only pays attention to the insertion and deletion of root objects or associated references, and does not pay attention to the modification of non-associated fields, because Apollo Cache can already handle this situation properly.

However, sometimes the changes of non-associated fields will also affect the query results. In the demos attached to this framework, the Department has a field named "avgSalary", which is a business calculation field to calculate the average salary of all employees under it. Therefore, modification of the salary field of Employee object will cause the avgSalary of its Department parent object to change.

You can handle this kind of business calculation as follows

```tsx
import { FC, memo } from "react";
import { useTypedQuery } from "./__generated";
import { query$, departmentConnection$, departmentEdge$, department$$, employee$ } from "./__generated/fetchers";

export const Demo: FC = memo(() => {
    
    const { data, loading, error } = useTypedQuery(
        query$.findDepartmentsLikeName(
            departmentConnection$.edges(
                departmentEdge$.node(
                    department$$
                    .avgSalary // [:1]
                )
            )
        ),
        {
            registerDependencies: {
                fieldDependencies: [ employee$.salary ] // [:2]
            }
        }
    )

    return (
        <>
            { error && <div style={{color: "red"}}>Error</div> }
            { loading && <div style={{color: "green"}}>Loading...</div> }
            { 
                data?.findDepartmentsLikeName?.edges?.map(edge =>
                    <div key={edge.node.id}>
                        Id: {edge.node.id} |
                        Name: {edge.node.name} |
                        Average salary: {edge.node.avgSalary}
                    </div>
                )
            }
        </>
    );
});
```
There are two comment marks in the above code, and their explanations are as follows

1. Query business calculation field
2. Specify business calculation dependencies. If the salary field of the Employee object is modified, this query will be automatically refreshed

## 5. Supporting demo

Complete functional demonstration[example/client/apollo-demo](../example/client/apollo-demo)


----------------------

Back to document home](./README.md) | [< Previous：Core idea: Fetcher](./fetcher/README.md) | [Next: Use with relay>](relay.md)







