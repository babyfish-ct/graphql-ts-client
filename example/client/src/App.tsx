import './App.css';
import { department$$, employee$$ } from './generated/fetchers';

const fetcher = 
  department$$
  .employees(
    employee$$
    .subordinates(
      employee$$
    )
  );
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <pre style={{textAlign: 'left'}}>
          { fetcher.toString() }
        </pre>
      </header>
    </div>
  );
}

export default App;
