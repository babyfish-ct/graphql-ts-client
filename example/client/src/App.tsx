import './App.css';
import { department$$, employee$$ } from './generated/fetchers';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <pre style={{textAlign: 'left'}}>
          {
            department$$
            .employees(
              employee$$
              .subordinates(
                employee$$
              )
            )
            .graphql
          }
        </pre>
      </header>
    </div>
  );
}

export default App;
