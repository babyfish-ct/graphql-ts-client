1.Create your react app, with "--template typescript"
```
yarn create react-app your-app-name --template typescript.
```
2. Add graphql-request
```
yarn add graphql-request
```
3. Add the api of graphql-ts-client

```
yarn add graphql-ts-client-api
```
4. Add the code generator tools of graphql-ts-client，with "--dev" options

```
yarn add --dev graphql-ts-client-codegen   
```
5. Create new folder "scripts" under the root dir under your project
6. Create new file "GraphQLCodeGenerator.js" that was created by step 5,
  add some code, like this
```
const {Generator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");

// GraphqQLServer address, eg: http://localhost:8080/graphql
const graphqlServerEndpdoint = ...; 

const generator = new Generator({
    schemaLoader: async() => {
      return loadRemoteSchema(graphqlServerEndpdoint);
    },
    targetDir: path.join(__dirname, "../src/generated"),
    recreateTargetDir: true,

    /*
     * Generate queries and mutations.
     *
     * "yarn add graphql-request" should be 
     * executed by yourself when this flag is enabled.
     */
    generateOperations: true
});

generator.generate();

```
  if the parameter "generateOperations" is false(default value), step 2 can be skipped.
7. Change your "package.json", add a new script
```
"scripts": {
  "codegen": "node scripts/GraphQLCodeGenerator.js"
}
```
8. Make sure the graphql server is alive, generate the client side code
```
  yarn codegen
```

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)