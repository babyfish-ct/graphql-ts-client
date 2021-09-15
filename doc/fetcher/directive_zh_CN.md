# 指令

*为了简化本问题，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

指令分为两个级别，字段级和碎片级

## 1. 字段级指令
```ts
import type { ParameterRef } from "graphql-ts-client-api";
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$, department$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
            .department(
                department$$,
                options => options.directive("include", {
                    if: ParameterRef.of("includeDepartment", "Boolean!")
                })
            )
        )
    )
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
        edges {
            node {
                id
                firstName
                lastName
                gender
                salary
                department 
                @include(if: $includeDepartment) {
                    id
                    name 
                }
            }
        }
    }
}
```
且附带的variables为
```
{ "includeDepartment": true }
```

因为Query的findEmployees并非简单字段，因为它有参数且是关联字段。所以代码生成器在QueryFetcher中为其生成了findEmployees()函数而非属性，lambda表达式“options => options.directive(...)”作为此函数最后一个参数，完成了字段级指令设置。

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

## 2.碎片级指令

碎片级指令一般开发少见，多用于和relay配合使用的模式中。比如，创建一个支持refetch的relay framgent.
```ts
import { createTypedFragment } from "./__generated";
import { employee$, employee$$ } from "./__generated/fetchers";
export const EMPLOYEE_ASSOCIATION_INFO_FRAGEMNT = createTypedFragment(
    "EmployeeAssociationInfoFragment",
    employee$
    .directive("refetchable", { queryName: "EmployeeAssociationInfoFragmentRefetchQuery" })
    .id
    .supervisor(
        employee$$
    )
    .subordinates(
        employee$$
    )
);
```
因为这个relay fragment在碎片级应用了@refetchable指令，所以是一个可刷新碎片，可以和useTypedRefetchableFragment配合使用。

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 别名](./alias_zh_CN.md)
