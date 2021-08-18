# This framework is integrated with '@apollo/client' to support out-of-the-box since 2.1.4

## Typed Hooks

There are at most 6 hooks in the generated code
1. useTypedQuery
2. useLazyTypedQuery
3. useTypedMutation
4. useSimpleQuery
5. useLazySimpleQuery 
6. useSimpleMutation

1, 2, and 3 are called typed hooks; 4, 5, and 6 are called simple hooks.

If the graphql schema contains queries/mutations return complex type(object, interface, union or list of them), useTypedQuery, useLazyTypedQuery and useTypedMuation will be generated.

It the graphql schema contains queries/mutations return simple type(string, number, enum), useSimpleQuery, useLazySimpleQuery and useSimpleMutation will be generated.

In this [apollo-demo](./), 4 hooks are generated
1. useTypedQuery(declared in [Queries.ts](src/__generated/Queries.ts))
2. useLazyTypedQuery(declared in [Queries.ts](src/__generated/Queries.ts))
3. useTypedMuation(declared in [Mutations.ts](src/__generated/Mutations.ts))
4. useSimpleMutation(declared in [Mutations.ts](src/__generated/Mutations.ts))

#### Typed Query hooks
```ts
export function useTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryResult<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>;

export function useLazyTypedQuery<
	TQueryKey extends keyof QueryFetchableTypes, 
	T extends object, 
	TDataKey extends string = TQueryKey
>(
	key: TQueryKey | {
		readonly queryKey: TQueryKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T>, 
	options?: QueryHookOptions<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]> & {
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }
	}
): QueryTuple<Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>, QueryVariables[TQueryKey]>;
```

##### 1. key or 'key.queryKey':
   Must be query name declared in graphql schema, otherwise ts will report compliation error. Two methods are supportted
```ts
const { loading, error, data } = useTypedQuery("findEmployees", ...more arguments...);
```
or 
```ts
const { loading, error, data } = useTypedQuery(
	{ queryKey: "findEmployees" },
   ...more arguments...
);
```

##### 2. key.dataKey
   Declare the root field name of data, it's optional, it's same 'key.queryKey' if it's not specified.

When it is specified
```ts
const { loading, error, data } = useTypedQuery(
    { 
        queryKey: "findEmployees", 
        dataKey: "employees" // The root field of data is renamed to "employees" 
    },
    ...more arguments...
);
if (data !== undefined) {
	console.log(data.employees); // The root field of data is "employees"
}
```
When it's not specified
```ts
const { loading, error, data } = useTypedQuery(
    "findEmployees", // dataKey is not speicified
    ...more arguments...
);
if (data !== undefined) {
	console.log(data.findEmployees); // The root field of data is still "findEmployees"
}
```

##### 3. key.operationName

	The operation name of qraphql request, it's optional, it's combined by 'key.queryKey' and md5 hash of fetcher(the second argument of hooks that will be discussed later) if it's not specified.

When it is specified
```ts
const { loading, error, data } = useTypedQuery(
    { queryKey: "findEmployees", operationName: "myGraphQLRequestName" }
    ...more arguments...
);
```
After executed, the http request is
```
{
    "operationName": "myGraphQLRequestName",
    "query": "query myGraphQLRequestName {
        findEmployees {
        ... more graphql fields ...
    }
}
```

When it is not not specified
```
const { loading, error, data } = useTypedQuery(
    "findEmployees"
    ...more arguments...
);
```
After executed, the http request is
```
{
    "operationName": "findEmployees_b69d71838bb0bef68f027d90609d6b97",
    "query": "query findEmployees_b69d71838bb0bef68f027d90609d6b97 {
        findEmployees {
        ... more graphql fields ...
    }
}
```

'b69d71838bb0bef68f027d90609d6b97' is the MD5 hash of fetcher(the seocond argument of hook), so operation name is unique for each fetcher.

In Apollo Client, developer need to specify "refetchQueries" in the options of mutation so that the affected queries will be refetched after mutation

This framework supports DependencyManager(will dicuss later) to reduce the difficulty of using "refetchQueries", it's optional, you can choose to use it or not.

    a. If you choose to use DependencyManager, it is recommended not to specify the "key.operationName" because it is unnecessary.

    b. If you don't use DependencyManager, it must be specified because it will be used by you in the "retfetchQueries" of mutation options.

Whether you use DependencyManager or not, you can specify it. Be careful, in this case its uniqueness is guaranteed by you.

##### 4. fetcher

The second argument of typed hook is 'fetcher', it's the core value of this framework, please see the GIF animation of homepage

```ts
const { loading, error, data } = useTypedQuery(
    "findEmployees",
    employee$$ // For root employee, fetch all the scalar feids
    .supervisor(
        employee$.id.firstName.lastName // For supervisor employee, only fetch 3 three fields
    )
    .subordinates(
        employee$.id.firstName.lastName // For subordinate employees, only fetch 3 three fields
    )
);

/*
 * Type of data:
 *
 *     readonly {
 *         { readonly id string; } &
 *         { readonly firstName: string; } &
 *         { readonly lastName: string } &
 *         { readonly gender: 'MALE' | 'FEMALE' } &
 *         { readonly salary: number } & {
 *             supervisor?: {
 *                 { readonly id string; } &
 *                 { readonly firstName: string; } &
 *                 { readonly lastName: string }
 *             },
 *             subordinates: readonly {
 *                 { readonly id string; } &
 *                 { readonly firstName: string; } &
 *                 { readonly lastName: string }
 *             }[]
 *         }
 *     }[];
 */

if (data !== undefined) {

    console.log(data.findEmployees[0].gender); // OK
    console.log(data.findEmployees[0].supervisor?.firstName); // OK
    console.log(data.findEmployees[0].subordinates[0].id); // OK

    console.log(data.findEmployees[0].subordinates[0].gender); // TS compilation error
    console.log(data.findEmployees[0].department.name); // TS compilation error
}

/* 
 * 1. employee$$: Two '$' symbols means default fetcher, it contains all scalar fields of GraphQL object
 * except the configuration "defaultFetcherExcludeMap" of code generator.
 * 
 * 2. employee$: One '$' symbol means empty fetcher, it contains nothing, 
 *.    so the fetched fields must be added by developers
 *
 * 3. Negative property: employee$$["~salary"] means all the scalar fields except 'salary'.
 *
 * 
 * Special cases:
 *       a. '__typename' does not support negative property.
 *       b. If polymorphism query is used, '__typename' will be automatically added 
 *          even if it's not contained by fetcher
 */
```

##### 4. options

The third argument of typed query hook is 'options', it's based on Apollo's querty options, but there is an new field 'registerDependencies', this new field is used to work with DependencyManager, we'll discuss DependencyManager later.

#### Typed Mutation Hook
```ts
export function useTypedMutation<
	TMutationKey extends keyof MutationFetchableTypes, 
	T extends object, 
	TContext = DefaultContext, 
	TCache extends ApolloCache<any> = ApolloCache<any>, 
	TDataKey extends string = TMutationKey
>(
	key: TMutationKey | {
		readonly mutationKey: TMutationKey;
		readonly dataKey?: TDataKey;
		readonly operationName?: string;
	}, 
	fetcher: Fetcher<MutationFetchableTypes[TMutationKey], T>, 
	options?: MutationHookOptions<Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, MutationVariables[TMutationKey], TContext> & {
		readonly refetchDependencies?: (
			result: FetchResult<Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>> &{ dependencies: RefetchableDependencies<T> }
		) => InternalRefetchQueriesInclude
	}
): MutationTuple<
	Record<TDataKey, MutationFetchedTypes<T>[TMutationKey]>, 
	MutationVariables[TMutationKey], 
	TContext, 
	TCache
>
```

'key' and 'fetcher' have been discussed in the previous chapter, ingore them here

The third argument 'options' is based on Apollo's mutation options, but there is an new field 'refetchDependencies', this new field is used to work with DependencyManager, we'll discuss DependencyManager later.

#### Simple hooks
Simple hooks is used for queries/mutations that don't return complex types, it does not have the argument 'fetcher', the other arguments have been have been discussed in the previous chapter, ignore them here.

## DependencyManager

DependencyManager is a optional functionality to reduce the difficulty of using "refetchQueries" of apollo mutation. It's optional, you can choose to use it or not.

DependencyManager is a global state object, it retains enough data so that it understands what kind of data mutations can affect each the active query of whole app.

Typed query hook accept fetcher so that it knows the subgraph boundary of queries, this is called dependency information.

1. When the react component that uses the query hook is mouted, the dependency information will be registered into DependencyManager
2. When the react component that uses the query hook is unmounted, the dependency information will be unregistered from DependencyManager
3. When the argument "fetcher" of query hook is changed, old information will be unregistered and the new information will be registered

The mutation hook(both typed and simple) know what the types of the objects have been changed by itself, so DependencyManager can provide information about which queries should be refetched for mutation.

#### 1. Setup global DependencyManager object.

In the genrated source code, there is a react componenent [&lt;DependencyManagerProvider/&gt;](src/__generated/DependencyManager.ts), the first step is to use it in your [App.tsx](src/App.tsx)

First, import it
```
import { DependencyManagerProvider } from './__generated';
```
Then, Add &lt;DependencyManagerProvider/&gt; near &lt;ApolloClient/&gt;
```tsx
<ApolloProvider client={client}>
    <DependencyManagerProvider defaultRegisterDependencies={true}>
        ...more elements...
    </DependencyManagerProvider>
</ApolloProvider>
```
1. 'defaultRegisterDependencies' is boolean property, it does not support default value, please specifiy it explicitly to remind yourself, true is better choice.
2. It does not matter whether it is inside or outside the &lt;AppolloProvider/&gt;, but for future compatibility, it is recommended to define it inside the &lt;AppolloProvider/&gt;.

#### 2. Register typed query hook into DependencyManager
```ts
const { loading, error, data } = useTypedQuery(
    "findDepartments",
    department$$.employees(employees$$),
    {
        registerDependencies: true // Registry the query itself
    }
);
```
If the property 'defaultRegisterDependencies' &lt;DependencyManagerProvider/&gt; is true, 'registerDependencies' can be ommited, like this
```ts
const { loading, error, data } = useTypedQuery("findDepartments", department$$.employees(employees$$));
```

This query fetches two object types: Department and Employee. That means this query must be refetched when Department/Employee is 
1. Inserted into database (Consider database rows as associated objects of the root object: whole app)
2. Deleted from database (Consider database rows as associated objects of the root object: whole app)
3. Inserted into an associaton of other objects (Eg: change many-to-one association to be non-null value, add elements into one-to-many association)
4. Deleted from an assocaition of other objects (Eg: change many-to-one association to be null value, remove elements from one-to-many association)

Notes, if the scalar fields of Department/Employee is changed by other mutations, this query need not to be refetched becasue Apollo Cache can handle this case very well. That means DependencyManager only interested in the changes of associations and ignore the change of scalars most of the time.

#### Refetch Queries in mutation

##### by typed mutation hook
The argument "options" of typed mutation is base on Apollo's mutation options, but a new field "refetchDependencies" is supported, this field can help you to refetch queries by DependencyManager.

*Notes: Apollo supports 'options.refetchQueries', typed mutation hook supports 'options. refetchDependencies', you can only specify one of them, otherwise you'll get a runtime error*

```ts
const [mutate, { loading, error }] = useTypedMutation(

    "mergeEmployee", // merge = insert or update

    employee$$ // All the scalar fields can be changed by this mutation
    .department(
        department$.id // The many-to-one association(foreign key) can be changed by this mutation.
    ),

    {
        variables: { input: ... some data collected from UI from... },
        refetchDependencies: result => {
            if (result.errors) { 
                return result.dependencies.ofError(); 
            }
            return result.dependencies.ofResult(
                ...old object retained by client..., 
                result.data?.mergeDepartment // new data object returned by server-side
            );
        }
    }
)
```

1. The mutation returns complex type so that "mergeEmployee" is typed mutation hook, not simple hooks. that means the server-side will returns the newest object, include some other changed fields that does not by client-side.

2. "result.dependencies.ofResult(value, result.data?.mergeDepartment)" asks the DependencyManager which queries should be refetched.
   
   a. If this mutation is used to insert a new Employee object and the many-to-one association 'department' is null, queries depend on 'Employee' will be refetched.

   b. If this mutation is used to insert a new Employee object and the many-to-one association 'department' is not null, queries depend on either 'Employee' or 'Department' will refetched.

   c. If this mutation is used to update existing object and the the many-to-one association 'department' is not changed, no queries will be refetched because Apollo cache can handle this case.

   d. If this mutation is used to update existing object and the the many-to-one association 'department' is changed, other queries depend on 'Department' will be refetched.
   
*Notes*

*a. Here, "queries ... will be refetched" means the queries that have registered themselves into DependencyManager.*

*b. Case "2.a" can not be validated by the [apollo-demo](./) becasue 'Employee.department' is declared as non-null field in the demo, it's impossible to create a new Employee without parent Department. 'Employee.supervisor' is nullable but the parent object and child object are of same type so that it cannot be used to validate that case too. Plaese validate that case in your project.*


3. "return result.dependencies.ofError();" means unconditionally refetch all the quires depends on either 'Department' or 'Employee'. 

    a. If an error is raised by the business logic of server-side, the database transaction will ensure that all internal operation steps have been rollbacked so that client-side need not to update anything, unless you met a bad server-side team.


    b. If an error is raised by network problem, client-side does not know whether the mutation has been executed or not, there is no way other than retry. This is why server-side developers say that idempotence is important.

In actual projects, these two situations should be carefully distinguished. However, in order to ensure the simplicity of the demo code, all of them are treated as case "b", so you see such barbaric behavior :)

4. The argument "fetcher" containers the id of associated object of 'Employee.department', it tells DependencyManager to compare the associated objects of the old and new objects, otherwise case "2.b" and case "2.d" cannot work. That means the mutation fetcher boundary is very important. How to determine the mutation fetcher boundary?

    a. If the business logic of server-side is simple, server executes the client's instructions rigidly, without additional behavior, this is not a problem, only need to make sure the mutation fetcher boundary can cover the modication boundary.

    b. If the business logic of server-side is complex, many unexpected associated data will also be modified in cascade(At least, this is unexpected for the client-side team), You'd better communicate with server-side team, discuss together whether it is possible to determine a boundary as small as possible

##### by simple mutation hook

Be different with typed mutation hook, the argument 'options' of simple mutations hook does not support 'refetchDependencies'. You need to use DependencyManager explicitly.

First, import it
```
import { useDependencyManager } from "../__generated/DependencyManager";
```
Then
```
const dependencyManager = useDependencyManager();

const [mutate, {loading, error}] = useSimpleMutation(
        "deleteEmployee", 
        { 
            variables: { id },
            refetchQueries: () => {
                return dependencyManager.allResources(employee$);
            }
        }
    );
```

In fact, deleting case is very simple. If there is no additional behavior on the server side, Apollo's 'cache.evict' can handle it so you need not to use DependencyManager. If you still wrote this code, using an empty fetcher "employee$" without any fields is enough.

1. The queries for Employee will be refetched
2. The queries do not query Employee but their fetcher boundary has intersect with Employee will be refetched.

Actually, DependencyManager supports two functions to answer the question about which queries should be refetched
```ts

/*
 * Deeply compare old object and new object, if there are some changes, find the operation names of affected queries
 *
 * 1. fetcher is used to specify a comparison boundary, DependencyManager won't compare 
 *     the asociated objects which are too deep so that they are outside of the boundary
 *
 * 2. fetcher does not accept empty fetcher, the fetcher must contain fields
 *
 * 3. Actually, the "result.dependencies.ofResult()" in the chapter about typed mutation hook calls this function
 */
resources<T extends object>(
    fetcher: Fetcher<string, T>, 
    oldObject: T | undefined, 
    newObject: T | undefined
): string[];

/*
 * Don't care the data, unconditionlly find the operation names of queries 
 *     whose fetcher boundary has intersect with this fetcher
 *
 * 1. fetcher accept empty fetcher without fields
 *
 * 2. Actually, the "result.dependencies.ofError()" in the chapter about typed mutation hook calls this function
 */
allResources(
    fetcher: Fetcher<string, any>
): string[];
```

#### Refetch quries when scalar field changed.

We've disucssed the DependencyManager only interested in the changes of associations most of the time, because the changes of scalar fields can be handled by Apollo cache.

In [apllo-demo](./), I built a case that needs to trigger refetching based on the change of the scalar fields: Employee supports a scalar field "salary", and Department supports as scalar field "avgSalary", this is a computed field, it means the average salary of its employees.

You can resolve this problem easily, like this

```
const { loading, error, data } = useTypedQuery({
    
    "findDepartemntsLikeName",

    /*
     * The query interested in the computed field 'avgSalary'
     * that means the average salary of its employees
     */
    department$$.avgSalary,

    {
        variables: { name },
        registerDependencies: {
            fieldDependencies: [
                /*
                 * If 'Employee.salary' is changed by mutations, this query 
                 * should be refetched even if 'Employee.salary' is scalar field
                 */ 
                employee$.salary 
            ]
        }
    }
});
```


____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)







