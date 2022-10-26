import { EnumInputMetadataBuilder } from 'graphql-ts-client-api';

const builder = new EnumInputMetadataBuilder();

builder.add("Gender");

builder.add("EmployeeInput", [
    {name: "gender", typeName: "Gender"}
]);

export const ENUM_INPUT_METADATA = builder.build();
