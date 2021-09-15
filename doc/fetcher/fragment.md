# Fragment and polymorphic query

*In order to simplify the discussion, except for the SpreadFragment chapter dedicated to relay, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

Fragment is a powerful capability defined in the GraphQL specification. This framework supports three fragments

1. Inline Fragment
2. Ordinary Fragment
3. Spread Fragment (relay dedicated)

Polymorphic query is also supported by fragments

## 1. Inline Fragment

Inline fragment is not a real fragment, it is just a syntactic sugar that looks like a fragment.

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$, employee$$, department$$ } from "./__generated/fetchers";

const ASSOCIATION_FRAGMENT = 
    employee$
    .department(department$$)
    .supervisor(employee$$)
    .subordinates(employee$$)
;

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
            .on(ASSOCIATION_FRAGMENT) // No name, inline fragment
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```
As above, the fetcher object supports a function named "on", uses another fetcher object to be the only parameter of the function. That argument fetcher is reused as inline fragment by current fetcher.

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
                department {
                    id
                    name
                }
                supervisor {
                    id
                    firstName
                    lastName
                    gender
                    salary
                }
                subordinates {
                    id
                    firstName
                    lastName
                    gender
                    salary
                }
                
            }
        }
    }
}

```

## 2. Ordinary Fragment

Ordinary fragment is the fragment defined in the GraphQL specification.

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$, employee$$, department$$ } from "./__generated/fetchers";

const ASSOCIATION_FRAGMENT = 
    employee$
    .department(department$$)
    .supervisor(employee$$)
    .subordinates(employee$$)
;

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
            .on(ASSOCIATION_FRAGMENT, "MyFragment") // It's ordinary fragment because name is specified
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```

As above, the fetcher object supports a function named "on", which accept two arguments. The first is another fetcher object which is used as fragment, and the second parameter is a string representing the name of the fragment. That argument fetcher is reused as ordinary fragment by current fetcher.

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
                ... MyFragment
            }
        }
    }
}
fragment MyFragment on Employee {
    department {
        id
        name
    }
    supervisor {
        id
        firstName
        lastName
        gender
        salary
    }
    subordinates {
        id
        firstName
        lastName
        gender
        salary
    }
}
```

## 3. Spread Fragment (relay dedicated)

Spreading fragments is a concept in relay. In this framework, the spread fragment is not a fetcher object, but a wrapper object of fetcher. This wrapper object must be derived from the SpreadFragment class defined in graphql-ts-client-api.

*Note that only when used with relay and when RelayGenerator is used to generate code, the generated fetcher interface will contain an "on" function that accepts SpreadFragment. If you don’t use relay, you can skip this chapter*

The biggest feature of SpreadFragment is that the fields defined in the child fragment are hidden in the return data type of the parent query/parent fragment, that is, the embedded child fragment will not pollute the return type inferred by its parent query/parent fragment. Only by using a dedicated API(such as useFragment) can extract the part of the data required by the child fragment form the data returned by the parent query/parent fragment.

For example：

EmployeeItem.tsx
```ts
import { FC, memo } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedFragment } from "../__generated";
import { employee$$ } from "../__generated/fetchers";

export const EMPLOYEE_ITEM_FRAGMENT = createTypedFragment( // [:1]
    "EmployeeItemFragment",
    employee$$
); 

export const EmployeeItem: FC<{
    item: FragmentKeyOf<typeof EMPLOYEE_ITEM_FRAGMENT>
}> = memo(({item}) => {

    const data = useTypedFragment(EMPLOYEE_ITEM_FRAGMENT, item); // [:4]

    return (
        <div>
            First Name: { data.firstName },
            Last Name: { data.lastName },
            Gender: { data.gender },
            Salary: { data.salary },
        </div>
    );
});
```

EmployeeList.tsx
```ts
import { FC, memo } from "react";
import { createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { query$, employeeConnection$, employeeEdge$, employee$ } from "../__generated/fetchers";
import { EmployeeItem, EMPLOYEE_ITEM_FRAGMENT } from "./EmployeeItem";

const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$
                .id
                .on(EMPLOYEE_ITEM_FRAGMENT) // [:2] Spread fragment
            )
        )
    )
);

export const EmployeeList: FC = memo(() => {

    const data = useTypedLazyLoadQuery(EMPLOYEE_LIST_QUERY, {});

    return (
        <>
            {
                data.findEmployees.edges.map(edge => 

                    // [: 3] Here, only the "id" field of "edge.node" can be accessed
                    // If you try to access other fields defined in SpreadFragment, 
                    // it will cause a compilation error

                    <EmployeeItem key={edge.node.id} item={edge.node}/>
                )
            }
        </>
    );
});
```

There are four comment marks in the code, and their explanations are as follows

1. The propagation fragment EMPLOYEE_ITEM_FRAGMENT is defined in EmployeeItem.tsx, this is a wrapper object of fetcher, the wrapper type is RelayFragment that is inherited from SpreadFragment of graphql-ts-client-api.
2. Import that fragment and embed it into the query so that the data of that fragment can be queried together.
3. All fields of that fragment are invisible to EmloyeeList. If try to access those fields here, it will cause compilation errors.
4. In EmployeeItem.tsx, using special APIs such as useTypedFragment to extract the data of fragment from the overall query results.

## 4. Polymorphic query

In GraphQL Schema, there are two ways to support inheritance relationships
1. Use interace type to achieve inheritance
```
interface SuperType {
    ...
}
type SubType1 extends SuperType {
    ...
}
type SubType2 extends SuperType {
    ...
}
```
2. Use union type to achieve inheritance
```
type AbstractType = SubType1 | SubType2;
type SubType1 {
    ...
}
type SubType2 {
    ...
}
```
No matter what kind of inheritance is used in GraphQL Schema, polymorphic queries are supported.

Take the demo attached to this framework as an example. Both Department and Employee are derived from Node. Query also supports a query field named node and returns Node type.

```
interface Node {
  id: ID!
}

type Department implements Node {
  id: ID!
  name: String!
  ...
}


type Employee implements Node {
  id: ID!
  firstName: String!
  lastName: String!
  ...
}

type Query {
  node(id: ID!): Node
  ...
}
```

We discussed above using fetcher's "on" function to support fragment. In those examples, the data type queried by current fetcher is the same as the data type queried by fragment fetcher. In fact, for the fragmented fetcher as a parameter, the data type queried by it can be a derived class of the data type queried by the current fetcher.

So we can implement polymorphic query like this

```ts
const QUERY = query$.node(
    node$
    .id
    .on(department$$) // [:1]
    .on(employee$$) // [:2]
);

async function test() {

    const response = await execute(QUERY, {
        variables: {id: "efa8ed2c-b00d-40e7-ba5d-5118178d0bc9"}
    });

    const node = response.node;

    if (node !== undefined) {

        console.log(`Node: id is ${node.id}, __typename is ${node.__typename}`); // [:3]

        if (node.__typename === "Department") {
            console.log(`Department: name is ${node.name}`); // [:4]
        } else if (node.__typename === "Employee") {
            console.log(`Employee: name is "${node.firstName} ${node.lastName}"`); // [:5]
        }
    }
}

```
There are 5 comment marks in the code, and their explanations are as follows

1. The current fetcher queries "Node", but the other fetcher which is the argument of "on" function queries "Department". They are inconsistent, that represents a polymorphic query.
2. The current fetcher queries "Node", but the other fetcher which is the argument of "on" function queries "Employee". They are inconsistent, that represents a polymorphic query.
3. Here, it is impossible to determine what type the node variable is, so only the id and __typename fields of the node object can be accessed. Accessing other fields will cause compilation errors.
4. Here, it can be concluded that the node is instance of Department type, so only the id, __typename, and name fields of the node object can be accessed. Accessing other fields will cause compilation errors.
5. Here, it can be concluded that the node is instance of Employee type, so only the id, __typename, firsName, lastName, gender and salary fields of the node object can be accessed. Accessing other fields will cause compilation errors.

*Note: Once a polymorphic query is used, the __typename field will always be requested. Even if __typename is not explicitly stated in the request code*

Finally, the GraphQL request generated at runtime is
```
query ($id: ID!) {
    node(id: $id) {
        id
        __typename
        ... on Department {
            id
            name
        }
        ... on Employee {
            id
            firstName
            lastName
            gender
            salary
        }
    }
}
```

----------------------
[Back to parent](./README.md) | [< Previous: Variables](./variables.md) ｜ [Next: Alias >](./alias.md)
