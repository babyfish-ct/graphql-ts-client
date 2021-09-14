# 默认Fetcher

*为了简化本问题，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

## 1. 默认Fetcher基本用法

在实际项目中，对象的字段可能非常多，使用一个一个地书写会特别枯燥，例如
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
            .gender
            .salary
        )
    )
);
```

这里，Employee类有5个字段：id、firstName、lastName、gender、salary，我们写了5行代码。但是，如果有50个字段呢？难道我们写50行代码？

上文中用到过的一些诸如query$、employeeConnection$、employeeEdge$、employee$常量，这些以"$"结尾的全局常量叫做Empty Fetcher，它们不包含任何字段，但是它们可以用于创建其它Fetcher。

代码生成器还会生成一些以"$$"结尾的全局常量，叫做默认Fetcher，它们包含了所有的简单字段，即既无参数也非关联的字段。在[example/client/async-deom/src/__generated/fetchers/EmployeeFetcher.ts]中，你会发现如下代码
```
export const employee$: EmployeeFetcher<{}, {}> = createFetcher(...);

export const employee$$ = 
	employee$
		.id
		.firstName
		.lastName
		.gender
		.salary
;

```
不难发现，和employee$不同，employee$$已经包含了所有简单字段。

默认Fetcher可以让我们的代码大幅简化，在字段很多的实际项目中尤其明显
```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();

```
运行时发出的请求为
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

## 2. 负字段
默认Fetcher包含了所有的简单字段，我可能不需要这么多，我们需要默认Fetcher中大部分简单字段，但是要排初少量的不需要的字段。这是可以使用负属性，从默认Fetcher中去掉不需要的简单属性。负字段以"~"符号开头

此例子中，我们查询默认Fetcher中除gender外的所有字段

```ts
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$["~gender"] // 使用默认Fetcher中除gender外的所有字段
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();

```
运行时发出的请求为
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
				salary
			}
		}
	}
}
```

注意：以下三种字段不支持负字段
1. __typename
2. 但参数的字段
3. 关联字段

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 基本用法](./basic_zh_CN.md) ｜ [下一篇: 参数 >](./variables_zh_CN.md)