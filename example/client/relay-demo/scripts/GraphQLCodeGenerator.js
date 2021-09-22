const { RelayGenerator, loadRemoteSchema } = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new RelayGenerator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/__generated"),
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    },
});
generator.generate();
