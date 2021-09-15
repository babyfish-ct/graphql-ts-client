# Directives

*In order to simplify the discussion, except for the chapter dedicated to relay, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

Directives are divided into two levels, field level and fragment level

## 1. Field-level directives
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
            variables: { includeDepartment: true } // Specify parameters for the @include directive
        }
    );
    console.log(JSON.stringify(response));
}

test();
```

Notice:
1. The @include directive is used here, but the first parameter of the directive function is "include", not "@include"
2. As in the parameter chapter, ParameterRef is used here. But there is a difference. When the "ParameterRef.of" function is used in the directive function, the second parameter must be specified as the GraphQL type, otherwise it will cause a runtime exception

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
And the attached variables are
```
{ "includeDepartment": true }
```

The findEmployees of Query is not a simple field because it has parameters and is an associated field. Therefore, the code generator generated the "findEmployees()" function instead of the "findEmployees" property in QueryFetcher, and the lambda expression 'options => options.directive(...)' was used as the last parameter of this function to complete the directive setting.

However, for some simple fields that have neither parameters nor associations, the code generator generates readonly properties instead of functions. How to do it? In fact, for these simple fields, the code generator not only generates readonly properties, but also generates functions whose name end with "+". Take the firstName attribute in [example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts](../../example/client/async-demo/src/__generated/fetchers/EmployeeFetcher.ts) as an example.

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
Most development uses the firstName property to keep the code concise. If you want to use aliases or directives, just use the "firstName+" function.

## 2.Fragment-level directives

Fragment-level directives are unusual, they are mostly used with relay. For example, create a refetchable relay framgent.
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
This relay fragment applies the @refetchable directive at the fragment level, so it is a refetchable fragment and can be used by useTypedRefetchableFragment.

----------------------
[Back to parent](./README.md) | [< Previous: Aliases](./alias.md)
