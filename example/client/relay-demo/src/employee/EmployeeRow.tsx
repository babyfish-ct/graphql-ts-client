import { Button, Col, Row, Space, Tag } from "antd";
import { FC } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { memo } from "react";
import { FULL_WIDTH, LABEL, NO_DATA } from "../common/Styles";
import { createTypedFragment, FragmentKeyOf, useTypedFragment } from "../__generated";
import { department$$, employee$, employee$$ } from "../__generated/fetchers";
import { EmployeeDialog } from "./EmployeeDialog";

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

export const EmployeeRow: FC<{
    row: FragmentKeyOf<typeof EMPLOYEE_ROW_FRAGEMENT>
}> = memo(({row}) => {

    const data = useTypedFragment(EMPLOYEE_ROW_FRAGEMENT, row);

    const [dialog, setDialog] = useState(false);

    const onEditClick = useCallback(() => {
        setDialog(true);
    }, []);

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
                            <Button>Delete</Button>
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