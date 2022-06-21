import { EnumInputMetadataBuilder } from 'graphql-ts-client-api';

export const ENUM_INPUT_METADATA = 
    new EnumInputMetadataBuilder()
    .add("Gender")
    .add("EmployeeInput", [
        {name: "gender", typeName: "Gender"}
    ])
    .build()
;