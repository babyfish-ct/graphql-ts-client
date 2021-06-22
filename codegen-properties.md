# All the configurable properties

|property|type|required|default value|
|--------|----|--------|-------------|
|schemaLoader|()=>Promise&lt;GraphQLSchema&gt;|true||
|targetDir|string|true||
|recreateTargetDir|boolean|false|false|
|indent|string|false|"\t"|
|objectEditable|boolean|false|false|
|arrayEditable|boolean|false|false|
|fetcherSuffix|string|false|"Fetcher"|
|fetchableSuffix|string|false|"Fetchable"|
|generateOperations|boolean|false|false|
|scalarTypeMap|{[key:string:] "string" \| "number" \| "boolean"}|false||
|defaultFetcherExcludeMap|{[key:string]: string[]}|false||

# Description

## schemaLoader
An async function thats Promise<GraphQLSchema>.

You can use the default function "loadRemoteSchema" provieded by "graphql-ts-client-codegen", if this default function does not match your requirement, you can implement it by yourself

## targetDir
The target directory, all the generated code will be saved under it.

eg
```
+-project_home
|
+----+-scripts
|    |
|    \------codegen.js // Your script that use code generator
|
\----+-src
     |
     \------generated // You want to generate code here
```
for this direactory structure, you should specify it as "../src/generated"

## recreateTargetDir
Indicates whether the target directory should be deleted before generating code so that the unnecessary files will be removed when the GraphQL schema of server is changed.

Its default value is false, but the suggested value is true. 

You cannot save your own code under the target directory so that it is mixed with the generated code,  you must known what you're doing when this configuration property is true.


## objectEditable
Indicates whether the keyword "readonly" should **NOT** be used on the fields of generated object types. the default value is false so that "readonly" can be generated. This is helpful for immutable object culture of react. 

[immer](https://github.com/immerjs/immer) is the best way to handle state changing business by immutable objects.


## arrayEditable
Indicates whether the keyword "readonly" should **NOT** be used on the array type of generated object fields. the default value is false so that "readonly" can be generated.

Look at this example

```
readonly items: readonly Item[];
```
The first "readonly" can be disabled by "objectEditable", the second "readonly" can be disabled by "arrayEditable".

There is a situation where you have to let "arrayEditable" to be true. The API of [antd](https://ant.design/) does not accept the second "readonly", such as the property "dataSource" of <Table/>.


## generateOperations
Indicates whether the queries and mutations should be generated.

This functionality is very important, but its default value is false. Why?

Be careful, "yarn add graphql-client" should be execute by yourself when this configuration property is true.

## scalarTypeMap

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

## defaultFetcherExcludeMap

For each GraphQLObject type, code generator supports two built-in fetcher instances. For example, [example/client/src/generated/fetchers/DepartmentFetcher.ts](https://github.com/babyfish-ct/graphql-ts-client/blob/master/example/client/src/generated/fetchers/DepartmentFetcher.ts) declares two fetcher instances:
```
export const department$: DepartmentFetcher<{}> = 
	createFetcher('employees');

export const department$$ = 
	department$
		.id
		.name
	;
```
The first one is empty fetcher, all the other fetchers should be create by it.

The second one is default fetcher, it contains the fields that are neither association nor parameterized. that means all the association fields and parameterized fields should be excluded form default fetcher. This configuration allows you to exclude more fields.(If all the fields are excluded by your configuration, the default fetcher itself will not be generated), eg:

```
{
	"defaultFetcherExcludeMap": {
		"ObjectType1": [ "field1OfType1", "field2OfType1"],
		"ObjectType2": [ "field1OfType2", "field2OfType2"]
	}
}
	
```

This configuration will be validated by the GraphQL schema, all the spelling errors will be found and reported, please don't worry about spelling errors.

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)