const codegen = require("graphql-ts-client-codegen");
const fs = require("fs");
const path = require("path");
const generator = new codegen.Generator({
    schemaExtractor: async() => {
        return `
        schema {
          query: Query
          mutation: Mutation
        }
        
        type Department {
          avgSalary: BigDecimal
          employees: [Employee!]!
          id: Long!
          name: String!
        }
        
        type Employee {
          department: Department!
          gender: Gender!
          id: Long!
          name: String!
          salary: BigDecimal
          subordinates: [Employee!]!
          supervisor: Employee
        }
        
        type LoginResult {
          token: String!
          user: User!
        }
        
        type Mutation {
          createDepartment(name: String!): Long!
          createEmployee(input: EmployeeInput!): Long!
          deleteDepartment(id: Long!): Boolean!
          deleteEmployee(id: Long!): Boolean!
          modifyDepartment(id: Long!, name: String!): Boolean!
          modifyEmployee(id: Long!, input: EmployeeInput!): Boolean!
        }
        
        type Query {
          department(id: Long!): Department
          departmentCount(name: String): Int!
          departments(descending: Boolean, limit: Int, name: String, offset: Int, sortedType: DepartmentSortedType): [Department!]!
          employee(id: Long!): Employee
          employeeCount(criteria: EmployeeCriteriaInput): Int!
          employees(criteria: EmployeeCriteriaInput, descending: Boolean, limit: Int, offset: Int, sortedType: EmployeeSortedType): [Employee!]!
          login(loginName: String!, password: String!): LoginResult!
          user(token: String!): User!
        }
        
        type User {
          loginName: String!
          nickName: String!
        }
        
        enum DepartmentSortedType {
          ID
          NAME
        }
        
        enum EmployeeSortedType {
          DEPARTMENT_ID
          DEPARTMENT_NAME
          ID
          NAME
          SALARY
        }
        
        enum Gender {
          FEMALE
          MALE
        }
        
        #Built-in java.math.BigDecimal
        scalar BigDecimal
        
        #Long type
        scalar Long
        
        input EmployeeCriteriaInput {
          departmentIds: [Long!]
          gender: Gender
          maxSalary: BigDecimal
          minSalary: BigDecimal
          name: String
        }
        
        input EmployeeInput {
          departmentId: Long!
          gender: Gender!
          name: String!
          salary: BigDecimal!
          supervisorId: Long
        }
        
        #Directs the executor to include this field or fragment only when the if argument is true
        directive @include(if: Boolean!) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT
        
        #Directs the executor to skip this field or fragment when the if argument is true.
        directive @skip(if: Boolean!) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT
        
        #Marks the target field/enum value as deprecated
        directive @deprecated(reason: String = "No longer supported") on FIELD_DEFINITION | ENUM_VALUE
        `;
    },
    targetDir: path.join(__dirname, "../src/api")
});
generator.generate();