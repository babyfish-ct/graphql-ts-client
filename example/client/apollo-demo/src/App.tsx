import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { css } from '@emotion/css';
import { DepartmentList } from './department/DepartmentList';
import { EmployeeList } from './employee/EmployeeList';

const client = new ApolloClient({
    uri: "http://localhost:8080/graphql",
    cache: new InMemoryCache()
});

function App() {

    return (
        <ApolloProvider client={client}>
            <div className={css`display:flex`}>
                <div className={css`width:40%`}>
                    <DepartmentList/>
                </div>
                <div className={css`width:60%`}>
                    <EmployeeList/>
                </div>
            </div>
        </ApolloProvider>
    );
}

export default App;
