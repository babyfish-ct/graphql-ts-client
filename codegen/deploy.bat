rd /S /Q dist
call tsc
robocopy dist ..\example\client\node_modules\graphql-ts-client-codegen\ /E
echo "deployed"
