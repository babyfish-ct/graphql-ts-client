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
import { NodeResolver } from "./bll/NodeResolver";

registerEnumType(Gender, { name: "Gender" });

const schema = buildSchemaSync({
    resolvers: [
        
        NodeResolver,
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
            graphiql: true,
            customFormatErrorFn: err => {
                console.log("Exception raised!", err);
                return err;
            }
        })
    )
    .listen(8080, () => {
        console.log("\n\n\nGraphQL server is started, please access http://localhost:8080/graphql");
    });
