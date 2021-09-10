import { css } from "@emotion/css";
import { Space, Form, Input, Button, Spin, List, Row, Col } from "antd";
import produce from "immer";
import { ChangeEvent, Suspense, useCallback } from "react";
import { useState } from "react";
import { FC, memo } from "react";
import { useGetSet, useUpdateEffect } from "react-use";
import { BusinessArgs } from "../common/BusinessArgs";
import { DEFAULT_PAGE_SIZE } from "../common/Constants";
import { environment, WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { FULL_WIDTH } from "../common/Styles";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { createTypedFragment, createTypedQuery, FragmentKeyOf, loadTypedQuery, useTypedPaginationFragment, useTypedPreloadedQuery } from "../__generated";
import { employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";
import { QueryArgs } from "../__generated/fetchers/QueryFetcher";
import { EmployeeDialog } from "./EmployeeDialog";
import { EmployeeRow, EMPLOYEE_ROW_FRAGEMENT } from "./EmployeeRow";
import { EmployeeSelect } from "./EmployeeSelect";

export const CONNECTION_KEY_ROOT_EMPLOYEE_LIST = "RootEmployee_list";

const EMPLOYEE_LIST_FRAGMENT = createTypedFragment(
    "EmployeeListFragment",
    query$
    .directive("refetchable", { queryName: "EmployeeListRefetchQuery"})
    .findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$
                .id
                .on(EMPLOYEE_ROW_FRAGEMENT)
            )
        ),
        options => options
        .alias("list") // Match "RootEmployee_list"
        .directive("connection", {
            key: CONNECTION_KEY_ROOT_EMPLOYEE_LIST,
            handler: WINDOW_PAGINATION_HANDLER
        })
    )
);

const EMPLOYEE_LIST_QUERY = createTypedQuery(
    "EmployeeListQuery",
    query$.on(
        EMPLOYEE_LIST_FRAGMENT
    )
);

const EMPLOYEE_LIST_INITIAL_QUERY_REFERENCE = loadTypedQuery(
    environment,
    EMPLOYEE_LIST_QUERY,
    { first: DEFAULT_PAGE_SIZE }
);

export const EmployeeList: FC = memo(() => {

    const list = useTypedPreloadedQuery(EMPLOYEE_LIST_QUERY, EMPLOYEE_LIST_INITIAL_QUERY_REFERENCE);
    const [args, setArgs] = useState<Args>({refresh: 0});
    const [dialog, setDialog] = useState(false);

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setArgs(old => produce(old, draft => {
            draft.name = value !== "" ? value : undefined;
        }));
    }, []);

    const onDepartmentIdChange = useCallback(departmentId => {
        setArgs(old => produce(old, draft => {
            draft.departmentId = departmentId;
        }));
    }, []);

    const onSupvervisorIdChagne = useCallback(supervisorId => {
        setArgs(old => produce(old, draft => {
            draft.supervisorId = supervisorId;
        }));
    }, []);

    const onRefreshClick = useCallback(() => {
        setArgs(old => produce(old, draft => {
            draft.refresh++;
        }))
    }, []);

    const onAddEmployeeClick = useCallback(() => {
        setDialog(true);
    }, []);

    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

    return (
        <>
            <Space direction="vertical" className={FULL_WIDTH}>
                <Form labelCol={{span: 8}} wrapperCol={{span: 16}} className={css({margin: "1rem"})}>
                    <Form.Item label="Name">
                        <Input value={args.name} onChange={onNameChange}/>
                    </Form.Item>
                    <Form.Item label="Department">
                        <DepartmentSelect optional value={args.departmentId} onChange={onDepartmentIdChange}/>
                    </Form.Item>
                    <Form.Item label="Supervisor">
                        <EmployeeSelect optional value={args.supervisorId} onChange={onSupvervisorIdChagne}/>
                    </Form.Item>
                    <Form.Item>
                        <Row>
                            <Col offset={8} span={16}>
                                <Space>
                                    <Button onClick={onRefreshClick}>Refresh</Button>
                                    <Button onClick={onAddEmployeeClick}>Add Employee...</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>
                <Suspense fallback={<Spin tip="Refetch employees..."/>}>
                    <EmployeeListImpl args={args} list={list}/>
                </Suspense>
            </Space>
            {
                dialog && <EmployeeDialog onClose={onDialogClose}/>
            }
        </>
    );
});

const EmployeeListImpl: FC<{
    args: Args,
    list: FragmentKeyOf<typeof EMPLOYEE_LIST_FRAGMENT>
}> = memo(({args, list}) => {

    const { 
        data, refetch, hasPrevious, hasNext, loadPrevious, loadNext, isLoadingPrevious, isLoadingNext 
    } = useTypedPaginationFragment(EMPLOYEE_LIST_FRAGMENT, list);

    const [getRefresh, setRefresh] = useGetSet(0);

    useUpdateEffect(() => {
        refetch(args, {fetchPolicy: getRefresh() !== args.refresh ? 'network-only' : undefined});
        setRefresh(args.refresh);
    }, [refetch, args, getRefresh, setRefresh]);
    
    const onPreviousPageClick = useCallback(() => {
        loadPrevious(DEFAULT_PAGE_SIZE);
    }, [loadPrevious]);

    const onNextPageClick = useCallback(() => {
        loadNext(DEFAULT_PAGE_SIZE);
    }, [loadNext]);

    return (
        <Space direction="vertical" className={FULL_WIDTH}>
            <List bordered>
                {
                    data.list.edges.map(edge => 
                    <List.Item key={edge.node.id}>
                        <EmployeeRow row={edge.node}/>
                    </List.Item>
                    )
                }
            </List>
            <div className={css({textAlign: "center"})}>
                <Space>
                    <Button 
                    disabled={!hasPrevious} 
                    loading={isLoadingPrevious}
                    onClick={onPreviousPageClick}>
                        &lt;Previous page
                    </Button>
                    <Button 
                    disabled={!hasNext} 
                    loading={isLoadingNext}
                    onClick={onNextPageClick}>
                        Next page&gt;
                    </Button>
                </Space>
            </div>
        </Space>
    );
});

interface Args extends BusinessArgs<QueryArgs["findEmployees"]> {
    readonly refresh: number;
}