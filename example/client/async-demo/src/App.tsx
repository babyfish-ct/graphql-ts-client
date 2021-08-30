/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { executeGraphQL } from './Environment';
import { EmployeeList } from './views/EmployeeList';
import { setGraphQLExecutor } from './__generated/Async';

/*
 * Install environment
 */
setGraphQLExecutor(executeGraphQL);

function App() {
  return (
    <div className="App">
      <EmployeeList/>
    </div>
  );
}

export default App;
