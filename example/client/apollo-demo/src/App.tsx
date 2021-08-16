import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { css } from '@emotion/css';
import { DepartmentList } from './department/DepartmentList';
import { EmployeeList } from './employee/EmployeeList';
import { DependencyManagerProvider } from './__generated';

const client = new ApolloClient({
    uri: "http://localhost:8080/graphql",
    cache: new InMemoryCache()
});

function App() {

    return (
        <ApolloProvider client={client}>
            <DependencyManagerProvider>
                <div className={css`display:flex`}>
                    <div className={css`width:50%`}>
                        <DepartmentList/>
                    </div>
                    <div className={css`width:50%`}>
                        <EmployeeList/>
                    </div>
                </div>
            </DependencyManagerProvider>
        </ApolloProvider>
    );
}

export default App;
