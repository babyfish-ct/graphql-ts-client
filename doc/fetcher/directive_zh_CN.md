# 指令

*为了简化本问题，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

指令分为两个级别，字段级和碎片级

## 1. 字段级指令
```
import type { ParameterRef } from "graphql-ts-client-api";
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
        )
    ),
    options => options.directive("include", {
           if: ParameterRef.of("includeDepartment", "Boolean!")
    })
);

async function test() {
    const response = await execute(
        QUERY,
        {
            variables: { includeDepartment: true } // 为@include指令指定参数
        }
    );
    console.log(JSON.stringify(response));
}

test();
```

注意：
1. 这里使用@include指令，但directive函数首个参数为"include"，并非"@include"
2. 和参数章节一样，这里用到了ParameterRef。但有区别，在指令中使用"ParameterRef.of"函数时，必须指定其第二个参数为GraphQL类型，否则会导致运行时异常

运行时发送的请求为
```
query (
    $before: String, 
    $last: Int, 
    $after: String, 
    $first: Int, 
    $mockedErrorProbability: Int, 
    $supervisorId: String, 
    $departmentId: String, 
    $name: String, 
    $includeDepartment: Boolean!
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
        edges
        @include(if: $includeDepartment) {
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
{ "includeDepartment": true }
```

## 2.碎片级指令


----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 别名](./alias_zh_CN.md)