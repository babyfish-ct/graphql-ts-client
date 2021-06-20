const {Generator, loadRemoteSchema} = require("graphql-ts-client-codegen");
const path = require("path");
const generator = new Generator({
    schemaLoader: async() => {
      return loadRemoteSchema("http://localhost:8080/graphql");
    },
    targetDir: path.join(__dirname, "../src/generated"),
    recreateTargetDir: true,

    /*
     * Daprtment.avgSalary is an expensive calculation property,
     * declaring it in the default fetcher "department$$" is not an good idea. 
     * 
     * Department.avgSalary is neither association nor parameterized,
     * so declaring it in "department$$" is the default behavior,
     * but we can exclude it manually.
     */
    defaultFetcherExcludeMap: {
      "Department": ["avgSalary"]
    },

    /*
     * Generate queries and mutations.
     *
     * "yarn add graphql-request" should be 
     * executed by yourself when this flag is enabled.
     */
    generateOperations: true
});

generator.generate();
