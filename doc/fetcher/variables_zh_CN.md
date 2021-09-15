# 参数

*为了简化本问题，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

## 1. 默认参数传播

query$的findEmployees是有参数的，如果在fetcher表达式中不显式指定参数，那么所有参数都会进一步像外传播，最终传播到execute函数

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
            // 这里可以指定所有参数：first, after, last, before, name, name, 
            //departmentId, supervsiorId, mockedErrorProbability)。
            //
            // 由于这些参数都是可选的，为了简洁，这里仅示范指定三个参数
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
            }
        }
    }
}
```
且附带的variables为
```
{ "first": 100, "name": "o" }
```

## 2. 参数覆盖

可以在fetcher表达式中覆盖参数，有两种覆盖方法
1. 使用常量指定参数
2. 使用ParameterRef做参数转发，这里的ParameterRef是一个定义在graphql-ts-client-api中的类

例如

```ts
import { ParameterRef } from "graphql-ts-client-api";
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    
    {
        first: 100, // first被常量100覆盖
        name: ParameterRef.of("namePattern") // 旧参数name被新参数namePattern覆盖

        // 注意，其余6个参数都会被隐式地覆盖为常量undefined
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
                namePattern: "o"
                // 1. 旧参数name被覆盖为新参数namePattern，此处只能指定namePattern；如果指定name，将得到编译报错
                // 2. 其余参数均被常量覆盖，如果指定，将得到编译报错
            }
        }
    );
    console.log(JSON.stringify(response));
}

test();

```
对这种情况而言，最终运行时发出的GraphQL请求为
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
且附带的variables为
```
{ "namePattern": "o" }
```

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 默认Fetcher](./default-fetcher_zh_CN.md) ｜ [下一篇: 碎片和多态查询 >](./fragment_zh_CN.md)
