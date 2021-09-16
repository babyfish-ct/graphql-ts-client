# 和relay一起使用

和标准的relay用法不同，无需使用babel-plugin-relay和relay-compiler，目的是为了避免一次又一次地执行"yarn relay"命令。

## 1. 准备工作

1. 建立项目

```
yarn create react-app <YourAppName> --template typescript

```
2. 进入项目目录，引入依赖项

```
yarn add \
    react-relay @types/react-relay \
    relay-runtime @types/relay-runtime \
    graphql-ts-client-api \
    graphql-ts-client-relay

yarn add graphql-ts-client-codegen --dev
```

3. 准备代码生成node脚本

进入项目目录，新建scripts子目录，在其下建立一个js文件，文件名随意，这里假设为GraphQLCodeGenerator.js。文件内容如下

```js
const {RelayGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new RelayGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    }
});
generator.generate();
```
4. 配置codegen命令

修改项目的package.json，找到scripts属性所对应的JSON对象，添加名为"codegen"的子属性
```
"codegen": "node scripts/GraphQLCodeGenerator.js"
```
5. 生成客户端代码

在确保服务端开启的情况下，执行如下命令，生产客户端命令
```
yarn codegen
```
在服务端接口不变的情况下，客户端代码只需要生成一次。这是和"yarn relay"命令的本质区别。

## 2. Fetcher包装器

由于relay本身具有特殊性，本框架的Fetcher不能直接使用，而是要包装成TypedQuery、TypedMutation和TypedFragment后再使用。

在[src/__generated/Relay.ts](../example/client/relay-demo/src/__generated/Relay.ts)中，有3个函数用于根据Fetcher创建包装对象。

1. createTypedQuery
2. createTypedMutation
3. createTypedFragment

使用例子如下

```ts
import { createTypedQuery, createTypedMutation, createTypedFragment } from './__generated';
import { 
    query$, 
    mutation$, 
    employeeConnection$, 
    employeeEdge$, 
    employee$$, 
    employee$, 
    department$ 
} from './__generated/fetchers';

export const EMPLOYEE_ASSOCIATION_FRAGEMNT = createTypedFragment(
    "EmployeeAssocaitionFragment",
    employee$
    .supervisor(
        employee$.id.firstName.lastName
    )
    .subordinates(
        employee$.id.firstName.lastName
    )
    .directive("refetchable", { queryName: "EmployeeAssocaitionFragmentRefetchQuery" })
);

export const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$$
                .on(DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT)
            )
        )
    )
);

export const EMPLOYEE_MERGE_MUTATION = createTypedMutation(
    "EmployeeMergeMutation",
    mutation$.mergeEmployee(
        employee$$
        .department(
            department$.id
        )
        .supervisor(
            employee$.id
        )
    )
);
```

1. 这些函数创建的包装对象必须以用全局常量保存下，供其他代码复用
2. 每个包装对象至少需要一个名称（比如这里的"EmployeeAssocaitionFragment"、"EmployeeAssocaitionFragmentRefetchQuery"、"EmployeeListQuery"和"EmployeeMergeMutation"），请保证这些名称的唯一性。如果出现了名字冲突，会导致运行时异常。

这些全局对象可供生成的的其他relay API使用，代码生成器会生成这些API用以取代relay的API

|src/__generated中生成的强类型API|relay的原生API|
|----------|-------------|
|loadTypedQuery|loadQuery|
|fetchTypedQuery|fetchQuery|
|useTypedQueryLoader|useQueryLoader|
|useTypedPreloadedQuery|usePreloadedQuery|
|useTypedLazyQuery|useLazyQuery|
|useTypedMutation|useMutation|
|useTypedFragment|useFragment|
|useTypedRefetchableFragment|useRefetchableFragment|
|useTypedPaginationFragment|usePaginationFragment|

新API和relay的API用法一致，但是有一个区别：relay API的参数接受relay-runtime中定义的GraphQLTaggedNode；而新API的参数接受上文的这些全局包装对象。

## 3. 配套demo

由于relay的复杂性，为relay提供了两个demo

### 3.1. relay-tutorial

针对查询功能的tutorial示范[example/client/relay-tutorial](../example/client/relay-tutorial)
1. 启动服务端
```
cd example/server
yarn install
yarn start
```

2. 启动客户端
```
cd example/client/relay-tutorial
yarn install
yarn start
```
访问http://localhost:3000

### 3.2. relay-demo

完整的功能演示[example/client/relay-demo](../example/client/relay-demo)
1. 启动服务端
```
cd example/server
yarn install
yarn start
```

2. 启动客户端
```
cd example/client/relay-demo
yarn install
yarn start
```
访问http://localhost:3000

----------------------

[回到文档首页](./README_zh_CN.md) | [< 上一篇：和@apollo/client一起使用](./apollo_zh_CN.md)
