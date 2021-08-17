/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { RecoilRoot } from 'recoil';
import { EmployeeList } from './views/EmployeeList';

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <EmployeeList/>
      </RecoilRoot>
    </div>
  );
}

export default App;
