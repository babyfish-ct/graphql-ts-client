# Aliases

*In order to simplify the discussion, this document does not discuss the usage of using @apollo/client or relay, it chooses the simplest independent usage. All fetchers in this article are taken from [example/client/async-demo/src/__generated/fetchers](../../example/client/async-demo/src/__generated/fetchers), and the "execute" function is taken from [example/client/async-demo/src/__generated/Async.ts](../../example/client/async-demo/src/__generated/Async.ts)*

You can specify aliases for fields in fetcher expressions. In the following example, "findEmployees" is renamed to "result"

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
            options => options.alias("result") // Rename "findEmployees" to "result"
        )
    );
    for (const edge of response.result.edges) { // Note, it's "response.result", not "response.findEmployees"
        const employee = edge.node;
        console.log(`id: ${employee.id}, firstName: ${employee.firstName}, lastName: ${employee.lastName}`);
    }
}

test();
```

In this example, the field name of the response object is no longer the default "findEmployees", but "result".

Finally, the actual GraphQL request sent is as follows

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

The findEmployees of Query is not a simple field because it has parameters and is an associated field. Therefore, the code generator generated the "findEmployees()" function instead of the "findEmployees" property in QueryFetcher, and the lambda expression 'options => options.alias("result")' was used as the last parameter of this function to complete the alias setting.

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

----------------------
[Back to parent](./README.md) | [< Previous: Fragment and polymorphic query](./fragment.md) | [Next：Directives >](./directive.md)
