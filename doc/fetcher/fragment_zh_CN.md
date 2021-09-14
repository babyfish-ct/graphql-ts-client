# 碎片和多态查询

*为了简化本问题，除relay专用的SpreadFragment章节外，本文档不讨论配合使用@apollo/client或relay的用法，以独立使用这种最简单的用法讲解。文中所有的fetcher取自[example/client/async-demo/src/__generated/fetchers](example/client/async-demo/src/__generated/fetchers)，也会用到[example/client/async-demo/src/__generated/Async.ts](example/client/async-demo/src/__generated/Async.ts)中的execute函数*

碎片是graphql一项强大的概念，本框架支持三种碎片
1. 内联碎片
2. 普通碎片
3. 传播碎片(relay专用)

还可以通过碎片支持多态查询

### 1. 内联碎片
内联碎片并非真正的碎片，它仅仅是一个看起来像碎片的语法糖。

Fetcher对象支持on函数，为on函数指定一个类型也是Fetcher的参数，则以内联的方式重用碎片。
```
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$, employee$$, department$$ } from "./__generated/fetchers";

const ASSOCIATION_FRAGMENT = 
    employee$
    .department(department$$)
    .supervisor(employee$$)
    .subordinates(employee$$)
;

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
            .on(ASSOCIATION_FRAGMENT) // 内联碎片
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```
运行时发送出的请求为
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
				department {
					id
					name
				}
				supervisor {
					id
					firstName
					lastName
					gender
					salary
				}
				subordinates {
					id
					firstName
					lastName
					gender
					salary
				}
				
			}
		}
	}
}

```

### 2. 普通碎片

普通碎片就是GraphQL规范中定义的碎片。

Fetcher对象支持on函数，为on函数指定两个参数，第一个参数是碎片fetcher,第二个参数是为碎片指定名称，则以普通的方式重用碎片。
```
import { execute } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$, employee$$, department$$ } from "./__generated/fetchers";

const ASSOCIATION_FRAGMENT = 
    employee$
    .department(department$$)
    .supervisor(employee$$)
    .subordinates(employee$$)
;

const QUERY = query$.findEmployees(
    employeeConnection$.edges(
        employeeEdge$.node(
            employee$$
            .on(ASSOCIATION_FRAGMENT, "MyFragment") // 将碎片名称指定为MyFragment
        )
    )
);
async function test() {
    const response = await execute(QUERY);
    console.log(JSON.stringify(response));
}

test();
```
运行时发送出的请求为
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
				... MyFragment
			}
		}
	}
}
fragment MyFragment on Employee {
	department {
		id
		name
	}
	supervisor {
		id
		firstName
		lastName
		gender
		salary
	}
	subordinates {
		id
		firstName
		lastName
		gender
		salary
	}
}
```

### 3. 传播碎片(relay专用)
传播碎片是relay中的概念。在本框架中，传播碎片并非Fetcher, 而是Fetcher的包装对象，此包装对象必须从graphql-ts-client-api中定义的SpreadFragment类派生。

*注意，仅当和relay一起使用，使用RelayGenerator生成代码时，Fetcher才具备接受SpreadFragment的on函数。如果你不使用relay，可以跳过此章节*

SpreadFragment最大的特色是，子碎片的字段在父查询/父碎片的返回类型中不存在，即，被嵌入的子碎片不会污染其父结构推导出的返回类型。只有利用专门的API才能从上层数据中提取碎片所返回的数据。

例如：

EmployeeItem.tsx
```ts
import { FC, memo } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedFragment } from "../__generated";
import { employee$$ } from "../__generated/fetchers";

export const EMPLOYEE_ITEM_FRAGMENT = createTypedFragment(
    "EmployeeItemFragment",
    employee$$
);

export const EmployeeItem: FC<{
    item: FragmentKeyOf<typeof EMPLOYEE_ITEM_FRAGMENT>
}> = memo(({item}) => {

    const data = useTypedFragment(EMPLOYEE_ITEM_FRAGMENT, item);
    return (
        <div>
            First Name: { data.firstName },
            Last Name: { data.lastName },
            Gender: { data.gender },
            Salary: { data.salary },
        </div>
    );
});
```

EmployeeList.tsx
```
import { FC, memo } from "react";
import { createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { query$, employeeConnection$, employeeEdge$, employee$ } from "../__generated/fetchers";
import { EmployeeItem, EMPLOYEE_ITEM_FRAGMENT } from "./EmployeeItem";

const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$
                .id // visible field
                .on(EMPLOYEE_ITEM_FRAGMENT) // invisible fields of spread fragment
            )
        )
    )
);

export const EmployeeList: FC = memo(() => {

    const data = useTypedLazyLoadQuery(EMPLOYEE_LIST_QUERY, {});

    return (
        <>
            {
                data.findEmployees.edges.map(edge => 
                    // 这里，只能访问edge.node的id字段，如果尝试访问其他在spread fragment定义的字段，将会导致编译错误
                    <EmployeeItem key={edge.node.id} item={edge.node}/>
                )
            }
        </>
    );
});
```
1. EmployeeItem.tsx中定义了传播碎片EMPLOYEE_ITEM_FRAGMENT，它是Fetcher的包装对象，继承自graphql-ts-client-api的SpreadFragment。
2. EmployeeList.tsx把导入这个碎片并嵌入到自己的查询中一并获取，但是碎片中的所有字段对EmloyeeList而言是不可见的，如果试图访问这些字段，将会导致编译错误
3. 只有在EmployeeItem.tsx中，使用诸如useTypedFragment这样的专用API，才能查询结果中被隐藏的碎片信息提取出来。

## 4. 多态查询

----------------------
[返回上级](./README_zh_CN.md) | [< 上一篇: 参数](./variables_zh_CN.md) ｜ [下一篇: 别名 >](./alias_zh_CN.md)