/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import "reflect-metadata";
import { registerEnumType } from "type-graphql";

export enum OrderMode {
    ASC,
    DESC
}

registerEnumType(OrderMode, { name: "OrderMode"});