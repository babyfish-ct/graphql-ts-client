# Basic usage

*In order to simplify the discussion, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

## 1. Simple query
Take a simple query as an example

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$ } from "./__generated/fetchers";

async function test() {
    const response = await execute(
        query$.findEmployees(
            employeeConnection$.edges(
                employeeEdge$.node(
                   employee$
                   .id
                    .firstName
                    .lastName
                )
            )
        )
    );
    for (const edge of response.findEmployees.edges) {
        const employee = edge.node;
        console.log(`id: ${employee.id}, firstName: ${employee.firstName}, lastName: ${employee.lastName}`);
    }
}

test();
```

The above code has two behaviors
1. Attribute access, for non-paramter and non-associated fields, such as: ".id", ".firstName", ".lastName"
2. Function call, for parameter fields or associated fields, such as: ".findEmployees()", ".edges()", ".node()"

In either case, these properties and functions will create a new Fetcher object without modifying the current Fetcher object. Therefore, Fetcher is read-only object, any Fetcher objects can be recorded and reused by global constants.

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
            }
        }
    }
}
```

## 2. ModelType

In the above example, the data type returned by the query is automatically inferred according to the strongly typed request, that type is implicit. In fact, you can use ModelType to explicitly get the inferred type, for example

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$
            .id
            .firstName
            .lastName
        )
    )
);

function printResponse(
    response: ModelType<typeof QUERY> // ModelType显式获取自动推导的类型
) {
    for (const edge of response.findEmployees.edges) {
        const employee = edge.node;
        console.log(`id: ${employee.id}, firstName: ${employee.firstName}, lastName: ${employee.lastName}`);
    }
}

async function test() {
    printResponse(await execute(QUERY));
}

test();
```

----------------------
[Back to parent](./README.md) | [Next: Default Fetcher >](./default-fetcher.md)

