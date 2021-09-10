import { Button, Col, Row, Space, Tag, Modal } from "antd";
import { FC } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { memo } from "react";
import { ParameterRef } from "graphql-ts-client-api";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { FULL_WIDTH, LABEL, NO_DATA } from "../common/Styles";
import { createTypedFragment, createTypedMutation, FragmentKeyOf, useTypedFragment, useTypedMutation } from "../__generated";
import { department$$, employee$, employee$$, mutation$ } from "../__generated/fetchers";
import { EmployeeDialog } from "./EmployeeDialog";
import { CONNECTION_KEY_ROOT_EMPLOYEE_LIST } from "./EmployeeList";
import { getConnectionID } from "../__generated/Relay";
import { CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS } from "./EmployeeSelect";

export const EMPLOYEE_ROW_FRAGEMENT = createTypedFragment(
    "EmployeeRowFragment",
    employee$$
    .department(
        department$$
    )
    .supervisor(
        employee$
        .id
        .firstName
        .lastName
    )
    .subordinates(
        employee$
        .id
        .firstName
        .lastName
    )
);

const EMPLOYEE_DELETE_MUTATION = createTypedMutation(
    "EmployeeDeleteMutation",
    mutation$
    .deleteEmployee(
        options => options.directive("deleteEdge", { connections: ParameterRef.of("connections", "[ID!]!") })
    )
);

export const EmployeeRow: FC<{
    row: FragmentKeyOf<typeof EMPLOYEE_ROW_FRAGEMENT>
}> = memo(({row}) => {

    const data = useTypedFragment(EMPLOYEE_ROW_FRAGEMENT, row);

    const [remove, removing] = useTypedMutation(EMPLOYEE_DELETE_MUTATION);

    const [dialog, setDialog] = useState(false);

    const onEditClick = useCallback(() => {
        setDialog(true);
    }, []);

    const onDeleteClick = useCallback(() => {
        Modal.confirm({
            title: "Are your sure",
            content: `Are you sure to delete the employee '${data.firstName} ${data.lastName}'`,
            onOk: () => {
                remove({
                    variables: { 
                        id: data.id,
                        connections: [
                            getConnectionID("client:root", {
                                key: CONNECTION_KEY_ROOT_EMPLOYEE_LIST,
                                handler: WINDOW_PAGINATION_HANDLER
                            }),
                            getConnectionID("client:root", CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS)
                        ]
                    },
                    optimisticResponse: {
                        deleteEmployee: data.id
                    }
                })
            }
        });
    }, [data]);

    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

    return (
        <>
            <Space direction="vertical" className={FULL_WIDTH}>
                <Row>
                    <Col flex={1}>
                        <Row>
                            <Col span={6} className={LABEL}>Name</Col>
                            <Col span={18}>
                                {data.firstName} {data.lastName}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Gender</Col>
                            <Col span={6}>
                                {data.gender}
                            </Col>
                            <Col span={6} className={LABEL}>Salary</Col>
                            <Col span={6}>
                                {data.salary}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Department</Col>
                            <Col span={18}>
                                {data.department.name}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Supervisor</Col>
                            <Col span={18}>
                                {
                                    data.supervisor === undefined ?
                                    <div className={NO_DATA}>No supervisor</div> :
                                    <div>{data.supervisor.firstName} {data.supervisor.lastName}</div>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} className={LABEL}>Subordinates</Col>
                            <Col span={18}>
                                {
                                    data.subordinates.length === 0 ?
                                    <div className={NO_DATA}>No subordinates</div> :
                                    <div>
                                        {
                                            data.subordinates.map(subordinate => 
                                                <Tag key={subordinate.id}>{subordinate.firstName} {subordinate.lastName}</Tag>
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
                            <Button loading={removing} onClick={onDeleteClick}>Delete</Button>
                        </Button.Group>
                    </Col>
                </Row>
            </Space>
            {
                dialog && <EmployeeDialog value={data} onClose={onDialogClose}/>
            }
        </>
    );
});