
# Download this project.


# Run server

1. 
``` 
cd ${project_home}/example/server
```
2. 
``` 
yarn install
```
3. 
```
yarn start
```
4. access "http://localhost:8080/graphql"


# Run Apollo Client
1. Make sure the server is running
2. 
``` 
cd ${project_home}/example/client/apollo-demo
```
3. 
```
yarn install
```
4. 
```
yarn start
```
4. access "http://localhost:3000"


# Re-generate client code(Optional)

1. Make sure the server is running

2. 
```
cd ${project_home}/example/client/apollo-demo
```
3. 
```
yarn codegen
```
4. All the files under '${project_home}/example/client/apollo-demo/src/__generated' have been recreated.

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)