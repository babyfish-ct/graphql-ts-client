# 别名

你可以在fetcher表达式中为字段指定别名。如下例子中，findEmployees被重命名为result

*为了简化本问题，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

async function test() {
    const response = await execute(
        query$.findEmployees(
            employeeConnection$.edges(
                employeeEdge$.node(
                   employee$$
                )
            ),
            options => options.alias("result") // 把findEmployees重命名为result
        )
    );
    for (const edge of response.result.edges) { // "response.result", not "response.findEmployees"
        const employee = edge.node;
        console.log(`id: ${employee.id}, firstName: ${employee.firstName}, lastName: ${employee.lastName}`);
    }
}

test();
```

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 碎片和多态查询](./fragment_zh_CN.md) | [下一篇：指令](./directive_zh_CN.md)