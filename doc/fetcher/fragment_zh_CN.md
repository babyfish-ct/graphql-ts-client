# 碎片和多态查询

*为了简化讨论，除relay专用的SpreadFragment章节外，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)中的execute函数*

碎片是GraphQL规范中定义的一种强大的能力，本框架支持三种碎片

1. 内联碎片
2. 普通碎片
3. 传播碎片(relay专用)

还可以通过碎片支持多态查询

## 1. 内联碎片

内联碎片并非真正的碎片，它仅仅是一个看起来像碎片的语法糖。

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
            .on(ASSOCIATION_FRAGMENT) // 内联碎片
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```
如上，Fetcher对象支持on函数，将另外一个Fetcher对象作为on函数唯一的参数，则以内联的方式重用碎片。被调用on函数的Fetcher对象叫当前Fetcher对象，作为参数的Fetcher对象叫碎片Fetcher对象。

最终，运行时发出的GraphQL请求为
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

## 2. 普通碎片

普通碎片就是GraphQL规范中定义的碎片。

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
            .on(ASSOCIATION_FRAGMENT, "MyFragment") // 将碎片名称指定为MyFragment
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```

如上，Fetcher对象支持on函数，为on函数指定两个参数，第一个参数是另外一个Fetcher对象，第二个参数是一个字符串，表示碎片的名称，则以普通的方式重用碎片。被调用on函数的Fetcher对象叫当前Fetcher对象，作为参数的Fetcher对象叫碎片Fetcher对象。

最终，运行时发出的GraphQL请求为
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

## 3. 传播碎片(relay专用)

传播碎片是relay中的概念。在本框架中，传播碎片并非Fetcher对象, 而是Fetcher的包装对象，此包装对象必须从graphql-ts-client-api中定义的SpreadFragment类派生。

*注意，仅当和relay一起使用，使用RelayGenerator生成代码时，代码生成器才会为Fetcher生成接受SpreadFragment类型参数的on函数。如果你不使用relay，可以跳过此章节*

SpreadFragment最大的特色在于，子碎片中定义的字段在父查询/父碎片的返回数据类型中是隐藏的，即，被嵌入的子碎片不会污染其父查询/父碎片推导出的返回类型。只有利用专门的API才能从父查询/父碎片返回的数据中提取出子碎片所需的那部分数据。

例如：

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
                    // [: 3] 这里，只能访问edge.node的id字段，
                    // 如果尝试访问其他在SpreadFragment定义的字段，将会导致编译错误
                    <EmployeeItem key={edge.node.id} item={edge.node}/>
                )
            }
        </>
    );
});
```

代码中有四处注释标记，各自的解释如下

1. EmployeeItem.tsx中定义了传播碎片EMPLOYEE_ITEM_FRAGMENT，它是Fetcher的包装对象，类型为RelayFragment，继承自graphql-ts-client-api的SpreadFragment。
2. EmployeeList.tsx导入这个碎片，并将之嵌入到自己的查询中一并获取
3. 碎片中的所有字段对EmloyeeList而言是不可见的，如果这这个位置试图访问这些碎片中的字段，将会导致编译错误
4. 只有在EmployeeItem.tsx中，使用诸如useTypedFragment这样的专用API，才能从整体查询结果中提取出被隐藏的碎片相关的那部分数据。

## 4. 多态查询

我们在前文中讨论了使用Fetcher的on函数支持碎片。在那些例子中，当前Fetcher所查询的数据类型和碎片Fetcher所查询的数据类型是一样的。

而在GraphQL Schema中，有两种方式支持继承关系
1. 利用Interace Type实现继承
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
2. 利用UnionType实现继承
```
type AbstractType = SubType1 | SubType2;
type SubType1 {
    ...
}
type SubType2 {
    ...
}
```
无论GraphQLSchema使用那种继承关系，本框架都支持多态查询，作为参数的碎片Fetcher，其所查询的类型允许是当前Fetcher所查询类型的派生类。

以本框架的所附带的demo为例，Department和Employee都是从node派生，Query也支持一个名称为node的查询

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

我们既可以基于这样的代码来实现多态查询

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
代码中有5处注释标记，各自的解释如下

1. 当前Fetcher所查询的数据类型为Node，但作为on函数参数的碎片Fetcher所查询的类型为Department，二者不一致，这代表了多态查询
2. 当前Fetcher所查询的数据类型为Node，但作为on函数参数的碎片Fetcher所查询的类型为Employee，二者不一致，这代表了多态查询
3. 在这里，无法确定node变量究竟是什么类型，所以，只可访问node对象的id和__typename字段。访问其他字段会导致编译报错。
4. 在这里，可以断定node变量是Department类型，所以，只可访问node对象的id、__typename、name字段。访问其他字段会导致编译报错。
5. 在这里，可以断定node变量是Employee类型，所以，只可访问node对象的id、__typename、firsName, lastName, gender和salary字段。访问其他字段会导致编译报错。

*注：一旦使用了多态查询，__typename字段总会被请求。即便请求代码中并未显示地写明__typename*

最终，实际发送的GraphQL请求如下
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
[返回上级](./README_zh_CN.md) | [< 上一篇: 参数](./variables_zh_CN.md) ｜ [下一篇: 别名 >](./alias_zh_CN.md)
