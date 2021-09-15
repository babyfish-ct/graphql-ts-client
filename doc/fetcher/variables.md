# Variables

*In order to simplify the discussion, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

## 1. Default parameter propagation

The findEmployees of query$ has parameters. If the parameters are not explicitly specified in the fetcher expression, then all parameters will be further propagated outside, and finally propagated to the execute function

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    
    // 这里并没有指定参数，所有参数都将传播给execute函数

    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
        )
    )
);

async function test() {
    const response = await execute(
        QUERY, 
        {
            // All parameters can be specified here: first, after, last, before, name, name, 
            //departmentId, supervsiorId, mockedErrorProbability)
            //
            // Since these parameters are optional, for the sake of brevity, 
            // only three parameters are specified for demonstration.
            variables: {
                first: 100,
                name: "o",
                departmentId: undefined
            }
        }
    );
    console.log(JSON.stringify(response));
}

test();

``` 
Finally, the GraphQL request generated at runtime is
```
query (
    $before: String, 
    $last: Int, 
    $after: String, 
    $first: Int, 
    $mockedErrorProbability: Int, 
    $supervisorId: String, 
    $departmentId: String, 
    $name: String
) {
    findEmployees(
        before: $before, 
        last: $last, 
        after: $after, 
        first: $first, 
        mockedErrorProbability: $mockedErrorProbability, 
        supervisorId: $supervisorId, 
        departmentId: $departmentId, 
        name: $name
    ) {
        edges {
            node {
                id
                firstName
                lastName
                gender
                salary
            }
        }
    }
}
```
And the attached variables are
```
{ "first": 100, "name": "o" }
```

## 2. Parameter coverage

Parameters can be overridden in fetcher expressions, there are two overriding methods

1. Use constants to specify parameters
2. Use ParameterRef for parameter forwarding, where ParameterRef is a class defined in graphql-ts-client-api

For example

```ts
import { ParameterRef } from "graphql-ts-client-api";
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    
    {
        first: 100, // "first" is covered by the constant 100
        name: ParameterRef.of("namePattern") // The old parameter "name" is overwritten 
                                             // by the new parameter "namePattern"

        // Note that the remaining 6 parameters will be implicitly covered as the constant undefined
    },

    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
        )
    )
);

async function test() {
    const response = await execute(
        QUERY, 
        {
            variables: {

                // 1. The old parameter "name" is overwritten by the new  
                // parameter "namePattern", only "namePattern" can be specified here; 
                // if you specify name, you will get a compilation error
                namePattern: "o"
                
                // 2. The remaining parameters are covered by constants, 
                // if you specify any of them, you will get a compilation error
            }
        }
    );
    console.log(JSON.stringify(response));
}

test();

```
In this case, the GraphQL request generate at runtime is
```
query ($namePattern: String) {
    findEmployees(first: 100, name: $namePattern) {
        edges {
            node {
                id
                firstName
                lastName
                gender
                salary
            }
        }
    }
}
```
And the attached variables are
```
{ "namePattern": "o" }
```

----------------------
[Back to parent](./README.md) | [< Previous: Default Fetcher](./default-fetcher.md) ｜ [Next: Fragment and polymorphic query >](./fragment.md)
