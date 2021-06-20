const {Generator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new Generator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/generated"),
    generateOperations: true,
    recreateTargetDir: true,
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    }
});

generator.generate();
