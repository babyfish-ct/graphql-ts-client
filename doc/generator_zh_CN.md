# 代码生成器

本框架提供代码生成器，根据远程graphql服务自动生成客户端所需的TypeScript代码。但是和绝大部分类似框架不同，这里的代码生成工作是一次性的，只要服务的提供的API不变，你就可以只生成一次代码并一直开发下去

## 生成器种类

到目前为止，框架提供三种代码生成器

正对GraphQL Schema中定义的ObjectType, InterfaceType, UnionType, EnumType和InputType，三种代码生成器生成的代码几乎完全一样。区别在于和服务端HTTP通信相关的代码生成结果是不一样的。

使用任何代码生成器，都需以"--dev"模式要导入此包
```
yarn add graphql-ts-client-codegen --dev
```

### 1. AsyncGenerator

仅生成最简单的一个名为excute的async函数，接受参数并返回服务端的执行结果。没有任何额外的功能，比如react-hook风格的API和本地缓存管理。使用方法如下(在项目自定义命令的script文件中使用，非web项目源码文件)
```js
const { AsyncGenerator, loadRemoteSchema } = require("graphql-ts-client-codegen");
const path = require("path");

const generator = new AsyncGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated")
});

generator.generate();
```
可以通过构造函数参数传入丰富的配置，后续章节会详细介绍该配置。

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
    targetDir: path.join(__dirname, "../src/__generated")
});

generator.generate();
```
可以通过构造函数参数传入丰富的配置，后续章节会详细介绍该配置。

最终在生成的代码中，会出现新的react hook用于包装@apollo/client原生的API

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
    targetDir: path.join(__dirname, "../src/__generated")
});

generator.generate();
```

可以通过构造函数参数传入丰富的配置，后续章节会详细介绍该配置。

最终在生成的代码中，会出现新的react hook用于包装relay的原生的API

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



## 配置属性

如上文说，无论使用哪种Generator，其构造函数都需要一个配置对象。此配置对象属性如下

|属性|类型|是否必须|默认值|
|--------|----|--------|-------------|
|schemaLoader|()=>Promise&lt;GraphQLSchema&gt;|true||
|targetDir|string|true||
|indent|string|false|"\t"|
|objectEditable|boolean|false|false|
|arrayEditable|boolean|false|false|
|fetcherSuffix|string|false|"Fetcher"|
|excludedTypes|string[]|false||
|scalarTypeMap|{[key:string:] "string" \| "number" \| "boolean"}|false||
|defaultFetcherExcludeMap|{[key:string]: string[]}|false||

### schemaLoader
一个返回Promise<GraphQLSchema>类型的异步函数，用于获取GraphQL schema信息，用于生成代码。

graphql-ts-client-codegen保中提供了两个辅助函数，loadRemoteSchema和loadLocalSchema
```ts

export async function loadRemoteSchema(
    endpoint: string,
    headers?: { [key: string]: string }
): Promise<GraphQLSchema>;

export function loadLocalSchema(
    sdl: string
): GraphQLSchema;
```
loadRemoteSchema需要指定服务端地址；
loadLocalSchema需要指定schema defination文本。

如果这两个默认实现都无法帮助你实现schemaLoader，你可以用任意自定的方法实现。

## targetDir
指定一个目录，所有自动生成的代码将会存储在旗下

例如
```
+-project_home
|
+----+-scripts
|    |
|    \------codegen.js // 这是你使用graphql-ts-client-codegen的node js文件
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

Code generator can handle some scalar types by itself, but scalar type name can be defined as any text by server-side, not all the scalar types can be handled automatically, eg:

```
{
	"scalarType": { 
		"Int8": "number", 
		"Int16": "number",
		"Int32": "number", 
		"Int64": "number"
	}
}
```
Code generator will consider "Int8", "Int16", "Int32" and "Int64" to be "number" according to this configuration.

You can also use the configuration to override the default behavior of code generator. If the scalar type that can be automatically handled by code generator is configured here, the user configuration has higher priority.

### defaultFetcherExcludeMap

对于GraphQL Schema中的大部分ObjectType而言, 代码生成器都是生成两个内置的fetcher实例. 例如, [example/client/async-demo/src/__generated/fetchers/DepartmentFetcher.ts](../example/client/src/ascync-demo/__generated/fetchers/DepartmentFetcher.ts) 文件定义连个两个实例:
```
export const department$: DepartmentFetcher<{}> = 
	createFetcher(...);

export const department$$ = 
	department$
		.id
		.name
	;
```
第一个Fetcher叫做空Fetcher, 其余所有Fetcher都基于它构建.

第二个Fetcher叫做默认Fetcher, 它保护所有无参数且非关联的字段. 及有参数的字段和关联字段会被排除在外. 这个配置允许你排除更多的字段(如果所有字段都被排除了，默认Fetcher本身就不被生成了), 该属性例子如下:

```
{
	"defaultFetcherExcludeMap": {
		"ObjectType1": [ "field1OfType1", "field2OfType1"],
		"ObjectType2": [ "field1OfType2", "field2OfType2"]
	}
}
	
```

在框架的所有内置例子项目中，Department.avgSalary属性都被排除。虽然它既没有参数也不是关联字段，但是作为一个计算字段，它的开销并不低，为了性能考虑，它从默认Fetcher中被排除

此配置会被GraphQL schema验证, 无需担拼写错误，如果出现拼写错误，将会导致报错.

____________________

[Back to home](../)





