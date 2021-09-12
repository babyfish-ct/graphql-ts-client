import { Row, Col, Space, Tag, Button, Modal } from "antd";
import { ParameterRef } from "graphql-ts-client-api";
import { useCallback } from "react";
import { useState } from "react";
import { FC, memo } from "react";
import { FULL_WIDTH, LABEL, NO_DATA } from "../common/Styles";
import { FragmentKeyOf, useTypedMutation, createTypedFragment, createTypedMutation, getConnectionID, useTypedRefetchableFragment } from "../__generated";
import { DepartemntDialog } from "./DepartmentDialog";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { department$$, employee$, mutation$ } from "../__generated/fetchers";
import { CONNECTION_KEY_ROOT_DEPARTMENT_LIST } from "./DepartmentList";
import { CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS } from "./DepartmentSelect";
import { Variables } from "react-relay";
import { useFragmentRefresher } from "../common/RefreshFragment";
import { ErrorWidget } from "../common/ErrorWidget";

export const DEPARTMENT_ROW_FRAGMENT = createTypedFragment(
    "DepartmentRowFragment",
    department$$
    .directive("refetchable", { queryName: "DepatmentRefetchQuery" })
    .avgSalary
    .employees(
        employee$
        .id
        .firstName
        .lastName
    )
);

const DEPARTMENT_DELETE_MUTATION = createTypedMutation(
    "DepartmentDeleteMuation",
    mutation$
    .deleteDepartment(
        options => options.directive("deleteEdge", { "connections": ParameterRef.of("connections", "[ID!]!")})
    )
);

export const DepartmentRow: FC<{
    listFilter: Variables,
    row: FragmentKeyOf<typeof DEPARTMENT_ROW_FRAGMENT>
}> = memo(({listFilter, row}) => {

    const [data, refetch] = useTypedRefetchableFragment(DEPARTMENT_ROW_FRAGMENT, row);

    useFragmentRefresher(data.id, refetch);

    const [remove, removing] = useTypedMutation(DEPARTMENT_DELETE_MUTATION);

    const [dialog, setDialog] = useState(false);

    const onEditClick = useCallback(() => {
        setDialog(true);
    }, []);

    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

    const onDeleteClick = useCallback(() => {
        Modal.confirm({
            title: "Are you sure",
            content: `Are you sure to delete the department '${data.name}'?`,
            onOk: () => {
                remove({
                    variables: {
                        id: data.id,
                        connections: [
                            getConnectionID(
                                "client:root", 
                                {
                                    key: CONNECTION_KEY_ROOT_DEPARTMENT_LIST,
                                    handler: WINDOW_PAGINATION_HANDLER
                                },
                                listFilter
                            ),
                            getConnectionID("client:root", CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS)
                        ]
                    },
                    optimisticResponse: {
                        deleteDepartment: data.id
                    },
                    onError: error => {
                        Modal.error({
                            title: "Delete failed",
                            content: <ErrorWidget error={error}/>
                        })
                    }
                });
            }
        });
    }, [data, remove, listFilter]);

    return (
        <>
            <Space direction="vertical" className={FULL_WIDTH}>
                <Row gutter={10}>
                    <Col flex={1}>
                        <Row>
                            <Col span={6} className={LABEL}>Name</Col>
                            <Col span={18}>{data.name}</Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Average salary</Col>
                            <Col span={18}>{data.avgSalary}</Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Employees</Col>
                            <Col span={18}>
                                {
                                    data.employees.length === 0 ?
                                    <div className={NO_DATA}>No employees</div> :
                                    <div>
                                        {
                                            data.employees.map(employee => 
                                                <Tag key={employee.id}>{employee.firstName} {employee.lastName}</Tag>
                                            )
                                        }
                                    </div>
                                }
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Button.Group size="small">
                            <Button onClick={onEditClick}>Edit</Button>
                            <Button onClick={onDeleteClick} loading={removing}>Delete</Button>
                        </Button.Group>
                    </Col>
                </Row>
            </Space>
            {
                dialog &&
                <DepartemntDialog listFilter={listFilter} value={data} onClose={onDialogClose}/>
            }
        </>
    );
});

