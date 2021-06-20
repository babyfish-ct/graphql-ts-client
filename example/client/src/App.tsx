import { RecoilRoot } from 'recoil';
import './App.css';
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
