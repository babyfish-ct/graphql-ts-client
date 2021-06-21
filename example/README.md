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

# Run Client

1. 
``` 
cd ${project_home}/example/client
```
2. 
```
yarn install
```
3. 
```
yarn start
```
4. access "http://localhost:3000"

# Re-generate client code(Optional)

1. Make sure the server is running

2. 
```
cd ${project_home}/example/client
```
3. 
```
yarn codegen
```
4. All the files under '${project_home}/example/client/src/generated' have been recreated.

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)