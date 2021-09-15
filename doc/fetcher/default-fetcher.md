# Default Fetcher

*In order to simplify the discussion, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

## 1. Basic usage

In actual projects, there may be a lot of object fields, and writing one by one will be particularly boring, for example
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
            .gender
            .salary
        )
    )
);
```

Here, the Employee class has 5 fields: id, firstName, lastName, gender, and salary, so we wrote 5 lines of code. But what if there are 50 fields? Are we going to write 50 lines of code?

Some of the constants used above such as query$, employeeConnection$, employeeEdge$, employee$, these global constants ending in "$" are called Empty Fetchers, they do not contain any fields, and their responsibility is to create other Fetchers.

The generator also generates some other global constants ending in "$$", which are called default fetchers. The default Fetcher contains all simple fields, that is, fields that have neither parameters nor associations. In [example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts](../../example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts), you will find the following code
```ts
export const employee$: EmployeeFetcher<{}, {}> = createFetcher(...);

export const employee$$ = 
    employee$
        .id
        .firstName
        .lastName
        .gender
        .salary
;

```
It is not difficult to find that, unlike employee$, employee$$ already contains all simple fields.

*Notice*

*1. The code generator will not generate default fetchers for Query and Mutation*

*2. Sometimes, although some fields are neither parameter fields nor associated fields, they have certain calculation overhead. This is often a business calculation field (for example, avgSalary of Department type in the demo attached to this framework). Obviously, it is not a good idea to let the default Fetcher include these fields. You can configure the code generator to ignore these fields. For details, please refer to [Code Generator](../generator.md)*

The default fetcher can greatly simplify our code, especially in actual projects with many object fields.
```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
        )
    )
);

async function test() {
    const response = await execute(QUERY);
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

## 2. Negative Fields

The default fetcher contains all simple fields, but sometimes, we may not need so many, we just need most fields in default fetcher and want to exclude other fields. At this time, you can use negative fields to exclude some unnecessary fields from the default fetcher. Negative fields start with the "~".

In the example, we query all fields of default fetcher except gender.

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$["~gender"] // Use all fields of default fetcher except gender
        )
    )
);

async function test() {
    const response = await execute(QUERY);
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
                salary
            }
        }
    }
}
```

Note: The following three fields do not support negative fields

1. __typename
2. Field with parameters
3. Associated field

----------------------
[Back to parent](./README.md) | [< Previous: Basic usage](./basic.md) ｜ [Next: variables >](./variables.md)
