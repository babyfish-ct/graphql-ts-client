# 代码生成器

本框架提供代码生成器，根据远程graphql服务自动生成客户端所需的TypeScript代码。但是和绝大部分类似框架不同，这里的代码生成工作是一次性的，只要服务的提供的API不变，你就可以只生成一次代码并一直开发下去

## 生成器种类

到目前为止，框架提供三种代码生成器
1. AsyncGenerator
2. ApolloGenerator
3. RelayGenerator

针对GraphQL Schema中定义的ObjectType, InterfaceType, UnionType, EnumType和InputType，三种代码生成器生成的代码几乎完全一样。区别在于和服务端HTTP通信相关的代码生成结果是不一样的。

使用任何代码生成器，都需以"--dev"模式要导入此包
```
yarn add graphql-ts-client-codegen --dev
```

### 1. AsyncGenerator

仅生成最简单的一个名为execute的async函数，接受参数并返回服务端的执行结果。没有任何额外的功能，比如react-hook风格的API和本地缓存管理。使用方法如下(在项目自定义命令的script文件中使用，非web项目源码文件)
```js
const { AsyncGenerator, loadRemoteSchema } = require("graphql-ts-client-codegen");
const path = require("path");

const generator = new AsyncGenerator({
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
可以通过构造函数参数传入配置，后续章节会详细介绍该配置。

为了让生成的代码可以通过编译，需要导入包
```
yarn add graphql-ts-client-api
```

### 2. ApolloGenerator

生成基于@apollo/client的客户端代码，提供react-hook风格的API以及本地缓存服务。使用方法如下(在项目自定义命令的script文件中使用，非web项目源码文件)
```js
const { ApolloGenerator, loadRemoteSchema } = require("graphql-ts-client-codegen");
const path = require("path");

const generator = new ApolloGenerator({
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
可以通过构造函数参数传入配置，后续章节会详细介绍该配置。

为了让生成的代码可以通过编译，需要导入包

```
yarn add \
    graphql \
    @apollo/client \
    graphql-ts-client-api
```

最终在生成的代码中，@apollo/client API被这些新API包装

|src/__generated中生成的强类型API|@apollo/client的原生API|
|----------|-------------|
|useTypedQuery|useQuery|
|useTypedLazyQuery|useLazyQuery|
|useTypedMutation|useMuation|

### 3. RelayGenerator

生成基于relay的客户端代码，提供react-hook风格的API以及本地缓存服务。使用方法如下(在项目自定义命令的script文件中使用，非web项目源码文件)
```js
const { RelayGenerator, loadRemoteSchema } = require("graphql-ts-client-codegen");
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

可以通过构造函数参数传入配置，后续章节会详细介绍该配置。

为了让生成的代码可以通过编译，需要导入包

```
yarn add \
    react-relay @types/react-relay \
    relay-runtime @types/relay-runtime \
    graphql-ts-client-api \
    graphql-ts-client-relay
```

最终在生成的代码中，relay API被这些新API包装

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
|getConnection|ConnectionHandler.getConnection|
|getConnectionID|ConnectionHandler.getConnectionID|



## 4. 配置属性

如上文说，无论使用哪种Generator，其构造函数都需要一个配置对象。此配置对象属性如下

|属性|类型|是否必须|默认值|
|--------|----|--------|-------------|
|schemaLoader|()=>Promise&lt;GraphQLSchema&gt;|是||
|targetDir|string|是||
|indent|string|否|"\t"|
|objectEditable|boolean|否|false|
|arrayEditable|boolean|否|false|
|fetcherSuffix|string|否|"Fetcher"|
|excludedTypes|string[]|否||
|scalarTypeMap|{[key:string:] string &#124; {readonly typeName: string, readonly importSource: string }}|否||
|defaultFetcherExcludeMap|{[key:string]: string[]}|否||
|tsEnum|boolean|false|false|

### schemaLoader
一个没有参数且返回Promise&lt;GraphQLSchema&gt;类型的异步函数，用于获取GraphQL schema信息，用于生成代码。

为了更简单地实现这个函数，graphql-ts-client-codegen保中提供了两个辅助函数，loadRemoteSchema和loadLocalSchema
```ts

export async function loadRemoteSchema(
    endpoint: string,
    headers?: { [key: string]: string }
): Promise<GraphQLSchema>;

export function loadLocalSchema(
    sdl: string
): GraphQLSchema;
```

loadRemoteSchema需要指定服务端地址；loadLocalSchema需要指定schema defination文本。

如果这两个辅助方法都无法帮助你实现schemaLoader，你可以用任意自定义的方法实现。

## targetDir
指定一个目录，所有自动生成的代码将会存储在其下

例如
```
+-project_home
|
+----+-scripts
|    |
|    \------GraphQLCodeGenerator.js // 这是你使用graphql-ts-client-codegen的node js文件
|
\----+-src
     |
     \------__generated // 你想在此目录生成TypeScript代码
```
对这个目录结构而言, 你可以将targetDir属性置顶为"../src/__generated"

### objectEditable
在被生成代码中，复杂类型的字段是否**不**加readonly修饰符。默认为fale, 即默认使用readonly修饰符，不可变对象对react开发很有帮助。 

若论基于不可变对象的修改数据状态，[immer](https://github.com/immerjs/immer)是一个值得推荐的选择。


### arrayEditable
在被生成代码中，数据类型是否**不**加readonly修饰符。默认为false，即默认使用readonly修饰符。

请看这个例子

```
readonly items: readonly Item[];
```
第一个readonly修饰符可以被objectEditable属性禁用。

第二个readonly修饰符可以被arrayEditable属性禁用。

有一个场景会让arrayEditable会显得有用，在低版本的[antd](https://ant.design/)中，数组上的readonly修饰符不被支持, 例如&lt;Table/&gt;的dataSource属性。不过，高版本的antd修复了这个问题。


### excludedTypes
指定那些类型需要被代码生成器忽略.

此配置会被GraphQL schema验证, 无需担拼写错误，如果出现拼写错误，将会导致报错.
 
### scalarTypeMap

代码生成器可以自己处理一些标量类型，但是标量类型名称可以被服务器端定义为任何文本，并不是所有的标量类型都可以自动处理，例如：

**基本类型映射**
```
{
	"scalarTypeMap": { 
		"Int8": "number", 
		"Int16": "number",
		"Int32": "number", 
		"Int64": "number"
	}
}
```
代码生成器将根据此配置将“Int8”、“Int16”、“Int32”和“Int64”视为“数字”。

您还可以使用配置来覆盖代码生成器的默认行为。 如果此处配置了代码生成器可以自动处理的标量类型，则用户配置的优先级更高。

**内联自定义类型映射**

```
{
	"scalarTypeMap": { 
		"GraphQLPoint": "{readonly x: number, readonly: number}" 
                // Becareful, this value is string
	}
}
```

**非内联自定义类型映射**
```
{
	"scalarTypeMap": { 
		"GraphQLPoint": {
		    typeName: "Point",
		    importSource: "commons/Type"
                    // "import { Point } from '../common/Types';" will be generated
		}
	}
}
```

### defaultFetcherExcludeMap

对于GraphQL Schema中的大部分ObjectType而言, 代码生成器都是生成两个内置的fetcher实例. 例如, [example/client/async-demo/src/__generated/fetchers/DepartmentFetcher.ts](../example/client/async-demo/src/__generated/fetchers/DepartmentFetcher.ts) 文件定义两个实例:
```
export const department$: DepartmentFetcher<{}> = 
	createFetcher(...);

export const department$$ = 
	department$
		.id
		.name
	;
```
第一个叫做空Fetcher, 其余所有Fetcher都基于它构建.

第二个叫做默认Fetcher, 它包含所有无参数且非关联的字段. 即，有参数的字段和关联字段会被排除在外. 这个配置允许你排除更多的字段(如果所有字段都被排除了，默认Fetcher本身就不被生成了), 该属性例子如下:

```
{
	"defaultFetcherExcludeMap": {
		"ObjectType1": [ "field1OfType1", "field2OfType1"],
		"ObjectType2": [ "field1OfType2", "field2OfType2"]
	}
}
	
```

在框架的所有内置例子项目中，Department.avgSalary属性都被排除。虽然它既没有参数也不是关联字段，但是作为一个计算字段，它的开销并不低，为了性能考虑，它从默认Fetcher中被排除，就像这样
```
defaultFetcherExcludeMap: {
    "Department": ["avgSalary"]
}
```

此配置会被GraphQL schema验证, 无需担拼写错误，如果出现拼写错误，将会导致报错.

### tsEnum

-  如果为false(默认)，为GraphQL的enum生成union类型，例如
   ```
   export type Gender = "MALE" | "FEMALE";
   ```
-  如果为true，生成TypeScript的enum类型，例如
   ```
   export enum Gender { MALE, FEMALE}
   ```
   > 注意：某些技术，例如recoil, 对TypeScript枚举类型不友好。这就是默认为false的原因。

____________________

[回到文档首页](./README_zh_CN.md) | [下一篇: 核心概念：Fetcher>](./fetcher/README_zh_CN.md)





