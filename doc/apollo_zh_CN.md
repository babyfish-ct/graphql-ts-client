# 和@apollo/client一起使用

## 1. 准备工作

1. 建立项目

```
yarn create react-app <YourAppName> --template typescript

```
2. 进入项目目录，引入依赖项

```
yarn add \
    graphql \
    @apollo/client \
    graphql-ts-client-api

yarn add graphql-ts-client-codegen --dev
```

3. 准备代码生成node脚本

进入项目目录，新建scripts子目录，在其下建立一个js文件，文件名随意，这里假设为GraphQLCodeGenerator.js。文件内容如下

```js
const {ApolloGenerator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new ApolloGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    },
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
在服务端接口不变的情况下，客户端代码只需要生成一次。



## 2. OperationName

在[src/__generated/Apollo.ts](../example/client/apollo-demo/src/__generated/Apollo.ts)中，定义了一些react hook API, 用于取代@apollo/cient的hook API

|src/__generated中生成的强类型API|@apollo/client的原生API|
|----------|-------------|
|useTypedQuery|useQuery|
|useTypedLazyQuery|useLazyQuery|
|useTypedMutation|useMuation|

新API和@apollo/client的API用法一致，但是有一个区别：@apollo/client的API的参数接受graphql中定义的DocumentNode；而新API的参数接受Fetcher。例如

```ts
import { FC, memo } from "react";
import { useTypedQuery } from "./__generated";
import { query$, employeeConnection$, employeeEdge$, employee$$ } from "./__generated/fetchers";

export const SimpleList: FC = memo(() => {
    
    const { data, loading, error } = useTypedQuery(
        query$.findEmployees(
            employeeConnection$.edges(
                employeeEdge$.node(
                    employee$$
                )
            )
        ),
        { variables: {first: 100} }
    );

    return (
        <>
            { loading && <div style={{color: "green"}}>Loading...</div>}
            { error && <div style={{color: "red"}}>Error</div> }
            {
                data?.findEmployees?.edges?.map(edge =>
                    <div key={edge.node.id}>
                        FirstName {edge.node.firstName} |
                        LastName {edge.node.lastName} |
                        Gender {edge.node.gender} |
                        Salary {edge.node.salary}
                    </div>
                )
            }
        </>
    );
});
```
此react组件渲染后，实际发送的GraphQL请求如下
```
query query_38ff4e765cd0dc01544cc9708c6dc7e7(
  $before: String, 
  $last: Int, 
  $after: String, 
  $first: Int, 
  $mockedErrorProbability: Int, 
  $supervisorId: 
  String, 
  $departmentId: String, 
  $name: String
) {
  findEmployees(
    before: $before
    last: $last
    after: $after
    first: $first
    mockedErrorProbability: $mockedErrorProbability
    supervisorId: $supervisorId
    departmentId: $departmentId
    name: $name
  ) {
    edges {
      node {
        id
        firstName
        lastName
        gender
        salary
        __typename
      }
      __typename
    }
    __typename
  }
}
```
且附带的variables为
```
{ first: 100 }
```

值得注意的是，这个请求的operationName是"query_38ff4e765cd0dc01544cc9708c6dc7e7"，其中"38ff4e765cd0dc01544cc9708c6dc7e7"是fetcher对象信息的MD5编码

在@apollo/client中，查询操作的operationName很重要，useMutation可以通过一个叫"refetchQueries"的参数指定一些operationName, 这些operationName所对应的查询将会在mutation完成后自动刷新。

在本框架中，为了简化@apollo/client的查询刷新，提供了依赖管理器（后文即将阐述）。依赖管理器可以让mutation完成后的查询刷新工作自动化，无需开发人员分心。在这种情况下，operationName不会被开发人员在代码中引用，所以是否具备可读性不再重要，只要保证唯一性即可，故采用md5编码自动生成operationName。

如果开发人需要使用@apollo/client经典的方法来处理mutation后的查询，operationName需要在用户代码中引用。这时，可以明确指定operationName，如下

```ts
const { data, loading, error } = useTypedQuery(
    query$.findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$$
            )
        )
    ),
    { 
        variables: {first: 100},
        operationName: "MyQueryOperationName" // 你明确指定operationName，不再使用md5
    }
);

```

相对于@apollo/client的Hook API，options参数多了一个可选的operationName属性，通过该属性，你可以明确指定operationName，而不是默认的md5编码。

注意

1. 如果明确指定了operationName，那么和经典的@apollo/client开发一样，你必须保证让所有查询的operationName的唯一性。
2. 即使你明确指定了operationName，依赖管理器仍然可以管理该查询。


## 3. 依赖管理器

依赖管理器用于降低useMutation中refetchQueries的指定难度，它是可选的，你可以选择使用或者不使用

*注意：如果使用依赖管理器，无需为查询指定operationName；否则，和经典的@apollo/client应用一样，所有需要自动刷新的查询都需要人为指定operationName并保证唯一性*

依赖管理器是维护了一系列全局状态
1. 当包含查询的react组件被mount时，查询及其fetcher所覆盖的对象依赖图将会被注册
2. 当包含查询的react组件被unmount时，查询及其fetcher所覆盖的对象依赖图将会被注销

所以，依赖管理器明白整个应用内任何一个活跃查询的对象依赖图

在执行mutaion之前，客户端持有旧对象；在执行mutation操作后，服务端会返回新对象。依赖管理器会递归比较新旧对象，试图发现根对象或关联引用有没有新建或删除行为，如果有，所有对象依赖范围范围与之有交集的查询都被判定为需要刷新。

依赖管理器仅关注根对象和关联引用的新建和删除操作，不关心对象内部数据变化，因为对象内部非关联数据的变化能够被Apollo Cache妥善处理。

### 3.1. 植入依赖管理器

在生成的代码的文件[src/__generated/DependencyManagerProvider.tsx](../example/client/apollo-demo/src/__generated/DependencyManager.tsx)中，有一个react组件&lt;DependencyManagerProvider/&gt;, 需要在App.tsx中引入它

```tsx
import { DependencyManagerProvider } from './__generated';

<ApolloProvider client={client}>
    <DependencyManagerProvider defaultRegisterDependencies={true}>
        ...more elements...
    </DependencyManagerProvider>
</ApolloProvider>
```
defaultRegisterDependencies是一个boolean属性, 其默认值为true。这里为了更清晰地示范，显式地指定它

### 3.2. 注册查询到依赖管理
```ts
const { loading, error, data } = useTypedQuery(
    query$.findDepartmentsLikeName(
        departmentConnection$.edges(
            departmentEdge$.node(
                department$$
                .employees(employee$$)
            )
        )
    ),
    { registerDependencies: true }
);
```
相对于@apollo/client的Hook API，options参数多了一个可选的registerDependencies属性。此属性为true表示需要当前react组件被mount时把此查询及其fetcher所覆盖的对象依赖图注册到依赖管理器中，知道react组件被unmount时再注销。

事实上，如果&lt;DependencyManagerProvider/&gt;的defaultRegisterDependencies为true，这里可以不给定registerDependencies属性，如
```ts
const { loading, error, data } = useTypedQuery(
    query$.findDepartmentsLikeName(
        departmentConnection$.edges(
            departmentEdge$.node(
                department$$
                .employees(employee$$)
            )
        )
    )
);
```
如你所见，看起来似乎没有什么变化。

这个查询的fetcher覆盖了两类对象,Department和Employee, 以下任何一种情况发生时，该查询都会自动刷新

1. Department作为根对象被插入到数据库
2. Employee作为根对象插入到数据库
3. Department作为根对象从数据库中被删除
4. Employee作为根对象从数据库中被删除
5. 数据库中，已存在的Employee对象指向Department的外键被修改（外键被修改 = 从旧的Departemnt对象的的employees集合中删除 + 在新的Department对象的employees集合中插入。所以关系变更本质上也是插入和删除操作）

再次说明，对于非关联字段的修改，依赖管理器不会关注。因为，Apollo Cache已经可以妥善处理这种情况。

### 3.3 在变更操作后刷新查询

```tsx

import { ModelType } from "graphql-ts-client-api";
import { FC, memo, useCallback, useState } from "react";
import { useTypedMutation, useDependencyManager } from "./__generated";
import { department$, employee$, employee$$, mutation$ } from "./__generated/fetchers";
import { EmployeeInput } from "./__generated/inputs";

const EMPLOYEE_MERGE_FETCHER = // [:1]
    employee$$
    .department(department$.id)
    .supervisor(employee$.id)
;

export const Editor: FC<{
    oldEmployee?: ModelType<typeof EMPLOYEE_MERGE_INFO> // [:2]
}> = memo(({oldEmployee}) => {
    
    const [input, setInput] = useState(toInput(oldEmployee));

    const dependencyManager = useDependencyManager();

    const [mutate, {loading, error }] = useTypedMutation(
        mutation$.mergeEmployee(
            EMPLOYEE_MERGE_FETCHER
        ),
        {
            variables: { input },
            refetchQueries: result => {
                
                if (result.errors) { 
                    return dependencyManager.allResources(EMPLOYEE_MERGE_INFO); // [:3]
                }

                const newEmployee = result.data?.mergeEmployee;
                return dependencyManager.resources( // [:4]
                    EMPLOYEE_MERGE_INFO,
                    oldEmployee,
                    newEmployee
                );
            }
        }
    );

    const onSaveClick = useCallback(() => {
        mutate();        
    }, [mutate]);

    return (
        <>
            {
               /* 
                * TODO: Add form UI, call "setInput" to modify temporary data 
                */
            }
            <button 
            disabled={loading}
            onClick={onSaveClick}>
                {loading ? "Saving" : "Save"}
            </button>
            { error && <div style={{color: "red"}}>Save failed</div> }
        </>
    );
});

function toInput(oldEmployee?: ModelType<typeof EMPLOYEE_MERGE_INFO>): EmployeeInput {
    伪代码
    如果oldEmployee为undefined(新建)：构建初始input
    否则（编辑），将oldEmployee转换为input
}

```

代码中有4处注释标记，各自的解释如下

1. 对于这个变更操作而言，服务端要执行的修改逻辑包含所有非关联字段和两个外键，其实，这就是服务端数据库中Employee的表结构。
2. oldEmployee参数可选，不指定表示新建，指定则表示编辑
3. 对于异常而言，有可能是网络通信异常。对这种情况，服务端是否执行成功其实是未知的。实际项目中，应该分辨异常的种类来判断是是否需要刷新；这里，为了简化文档，采用简单粗暴的方式，不分青红皂白，强行刷新所有和fetcher查询范围有交集的查询
4. 如果mutation执行成功，对比新旧对象再决定哪些查询应该刷新


## 4. 业务计算依赖

上文讨论过，依赖管理器仅关注根对象或关联引用的插入和删除，不会关注对非关联字段的修改，因为Apollo Cache已经可以妥善处理这种情况。

但是，有时非关联字段的变更也会影响查询结果。本框架所附带的demo中，Department具备一个avgSalary属性，该属性是一个业务计算字段，计算其下所有员工的平均薪资。因此，任何Employee对象的salary字段被修改都会引起其Department父对象的avgSalary的变化。

你可以如下处理这种业务计算

```tsx
import { FC, memo } from "react";
import { useTypedQuery } from "./__generated";
import { query$, departmentConnection$, departmentEdge$, department$$, employee$ } from "./__generated/fetchers";

export const Demo: FC = memo(() => {
    
    const { data, loading, error } = useTypedQuery(
        query$.findDepartmentsLikeName(
            departmentConnection$.edges(
                departmentEdge$.node(
                    department$$
                    .avgSalary // [:1]
                )
            )
        ),
        {
            registerDependencies: {
                fieldDependencies: [ employee$.salary ] // [:2]
            }
        }
    )

    return (
        <>
            { error && <div style={{color: "red"}}>Error</div> }
            { loading && <div style={{color: "green"}}>Loading...</div> }
            { 
                data?.findDepartmentsLikeName?.edges?.map(edge =>
                    <div key={edge.node.id}>
                        Id: {edge.node.id} |
                        Name: {edge.node.name} |
                        Average salary: {edge.node.avgSalary}
                    </div>
                )
            }
        </>
    );
});
```

上面的代码中有两处注释标记，各自的解释如下

1. 查询业务计算字段
2. 指定业务计算依赖项，如果Employee对象的salary字段被修改，那么该查询会自动刷新

## 5. 配套demo

完整的功能演示[example/client/apollo-demo](../example/client/apollo-demo)

1. 启动服务端
```
cd example/server
yarn install
yarn start
```

2. 启动客户端
```
cd example/client/apollo-demo
yarn install
yarn start
```
访问http://localhost:3000

----------------------

[回到文档首页](./README_zh_CN.md) | [< 上一篇：核心概念: Fetcher](./fetcher/README_zh_CN.md) | [下一篇: 和relay一起使用>](relay_zh_CN.md)
