# 基本用法

*为了简化讨论，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](../example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](../example/client/async-demo/src/__generated/Async.ts)中的execute函数*

## 1. 简单查询
以一个简单的查询为例

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

上面的代码有两种行为
1. 属性访问，针对无参数且非关联的字段，比如：".id", ".firstName", ".lastName"
2. 函数调用，针对有参数字段或关联字段，比如：".findEmployees()", ".edges()", ".node()"

无论是那种情况，这些属性和函数都会创建新的Fetcher对象，而不会修改当前Fetcher对象。所以，Fetcher是只读对象，任何Fetcher都可以用全局常量纪录并复用。

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
            }
        }
    }
}
```

## 2. ModelType

上面的例子中，查询返回的数据类型是根据查询阐述自动推导的类型。事实上，你可以使用ModelType显式地得到自动推导的类型，例如

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
[返回上级](./README_zh_CN.md) | [下一篇: 默认Fetcher >](./default-fetcher_zh_CN.md)

