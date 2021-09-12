import "./App.css";
import { RelayEnvironmentProvider } from 'react-relay';
import { environment } from './common/Environment';
import { Suspense } from 'react';
import { Col, Row, Spin } from 'antd';
import { css} from '@emotion/css';
import { DepartmentList } from './department/DepartmentList';
import { EmployeeList } from "./employee/EmployeeList";
import { addSourceChangeListener } from "./Hotload";

function App() {
    return (
        <RelayEnvironmentProvider environment={environment}>
            <Suspense fallback={
                <div className={css({textAlign: 'center'})}>
                    <Spin tip="Loading..."/>
                </div>
            }>
                <Row gutter={20}>
                    <Col span={12}>
                        <DepartmentList/>
                    </Col>
                    <Col span={12}>
                        <EmployeeList/>
                    </Col>
                </Row>
            </Suspense>
        </RelayEnvironmentProvider>
    );
}

export default App;

addSourceChangeListener(() => {
    console.log("Changed------------------------------");
});
