import { buildSchemaSync, registerEnumType } from "type-graphql";
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { DepartmentQuery } from "./bll/DepartmentQuery";
import { DepartmentResolver } from "./model/Department";
import { EmployeeResolver } from "./model/Employee";
import { Gender } from "./model/Gender";

registerEnumType(Gender, { name: "Gender" });

const schema = buildSchemaSync({
    resolvers: [DepartmentQuery, DepartmentResolver, EmployeeResolver]
});

express()
    .use(
        '/graphql', 
        graphqlHTTP({
            schema,
            graphiql: true
        })
    )
    .listen(8080, () => {
        console.log("GraphQL server is started, please access http://localhost:8080/graphql");
    });
