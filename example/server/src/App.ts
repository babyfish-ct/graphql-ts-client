/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import { buildSchemaSync, registerEnumType } from "type-graphql";
import express from 'express';
import cors from "cors";
import { graphqlHTTP } from 'express-graphql';
import { DepartmentService } from "./bll/DepartmentService";
import { DepartmentResolver } from "./model/Department";
import { EmployeeResolver } from "./model/Employee";
import { Gender } from "./model/Gender";
import { EmployeeService } from "./bll/EmployeeService";

registerEnumType(Gender, { name: "Gender" });

const schema = buildSchemaSync({
    resolvers: [
        
        DepartmentResolver, 
        EmployeeResolver,

        DepartmentService, 
        EmployeeService
    ]
});

express()
    .use(cors())
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
