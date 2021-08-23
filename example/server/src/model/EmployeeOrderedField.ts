/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import "reflect-metadata";
import { registerEnumType } from "type-graphql";

export enum EmployeeOrderedField {
    FIRST_NAME,
    LAST_NAME,
    SALARY
}

registerEnumType(EmployeeOrderedField, { name: "EmployeeOrderedField"});