# 别名

你可以在fetcher表达式中为字段指定别名。如下例子中，findEmployees被重命名为result

*为了简化讨论，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)中的execute函数*

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
    for (const edge of response.result.edges) { // 注意"response.result", 并非"response.findEmployees"
        const employee = edge.node;
        console.log(`id: ${employee.id}, firstName: ${employee.firstName}, lastName: ${employee.lastName}`);
    }
}

test();
```

在这个例子中，reponse对象的字段名不再是默认的findEmployees，而是result。

最终，实际发送的GraphQL请求如下
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
    result: findEmployees(
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

因为Query的findEmployees并非简单字段，因为它有参数且是关联字段。所以代码生成器在QueryFetcher中为其生成了findEmployees()函数而非属性，lambda表达式“options => options.alias("result")”作为此函数最后一个参数，完成了别名设置。

但是，一些既无参数也非关联的简单字段，代码生成器生成的是属性，而非函数，该怎么办呢？事实上，对这些简单字段而言，代码生成器不仅生成属性，也会生成一个函数，函数名以“+”结尾，以[example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts](example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts)中的firstName属性为例

```ts
    readonly firstName: EmployeeFetcher<T & {readonly "firstName": string}, TVariables>;

    "firstName+"<
        XAlias extends string = "firstName", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"firstName", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;
```
绝大部分开发都使用firstName属性保持代码的简洁性。如要使用别名或指令，使用"firstName+"函数即可。

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 碎片和多态查询](./fragment_zh_CN.md) | [下一篇：指令 >](./directive_zh_CN.md)
