import { css } from "@emotion/css";
import { Button, List, Space, Spin, Form, Input } from "antd";
import { useState } from "react";
import { ChangeEvent, Suspense, useCallback } from "react";
import { FC, memo } from "react";
import { DEFAULT_PAGE_SIZE } from "../common/Constants";
import { FULL_WIDTH } from "../common/Styles";
import { createTypedFragment, createTypedQuery, FragmentKeyOf, loadTypedQuery, useTypedPaginationFragment, useTypedPreloadedQuery } from "../__generated";
import { BusinessArgs } from "../common/BusinessArgs";
import { query$, QueryArgs } from "../__generated/fetchers/QueryFetcher";
import produce from "immer";
import { useGetSet, useUpdateEffect } from "react-use";
import { DepartemntDialog } from "./DepartmentDialog";
import { DepartmentRow, DEPARTMENT_ROW_FRAGMENT } from "./DepartmentRow";
import { department$, departmentConnection$, departmentEdge$ } from "../__generated/fetchers";
import { environment, WINDOW_PAGINATION_HANDLER } from "../common/Environment";

export const CONNECTION_KEY_ROOT_DEPARTMENT_LIST = "RootDepartment_list";

const DEPARTMENT_LIST_FRAGMENT = createTypedFragment(
    "DepartmentListFragment",
    query$
    .directive("refetchable", { queryName: "DepartmentListRefetchQuery"})
    .findDepartmentsLikeName(
        departmentConnection$
        .edges(
            departmentEdge$.node(
                department$
                .id
                .on(DEPARTMENT_ROW_FRAGMENT)
            )
        ),
        options => options
        .alias("list") // Match 'RootDepartment_list'
        .directive("connection", {
            key: CONNECTION_KEY_ROOT_DEPARTMENT_LIST,
            handler: WINDOW_PAGINATION_HANDLER
        })
    )
);

const DEPARTMENT_LIST_QUERY = createTypedQuery(
    "DepartmentListQuery",
    query$.on(DEPARTMENT_LIST_FRAGMENT)
);

const DEPARRTMENT_LIST_INITIAL_QUERY_REFERENCE = loadTypedQuery(
    environment,
    DEPARTMENT_LIST_QUERY,
    { first: DEFAULT_PAGE_SIZE }
);

export const DepartmentList: FC = memo(() => {

    const data = useTypedPreloadedQuery(DEPARTMENT_LIST_QUERY, DEPARRTMENT_LIST_INITIAL_QUERY_REFERENCE!);

    const [args, setArgs] = useState<Args>({refresh: 0});
    const [dialog, setDialog] = useState(false);
    
    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setArgs(old => produce(old, draft => {
            draft.name = value !== "" ? value : undefined
        }));
    }, []);

    const onRefreshClick = useCallback(() => {
        setArgs(old => produce(old, draft => {
            draft.refresh++;
        }));
    }, []);

    const onAddDepartmentClick = useCallback(() => {
        setDialog(true);
    }, []);

    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

    return (
        <>
            <Space direction="vertical" className={FULL_WIDTH}>
                <Form layout="inline" className={css({margin: "1rem"})}>
                    <Form.Item label="Name">
                        <Input name={args.name} onChange={onNameChange}/>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={onRefreshClick}>Refresh</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={onAddDepartmentClick}>Add Department...</Button>
                    </Form.Item>
                </Form>
                <Suspense fallback={<Spin tip="Refetch departments..."/>}>
                    <DepartmentListImpl args={args} list={data}/>
                </Suspense>
            </Space>
            {
                dialog &&
                <DepartemntDialog onClose={onDialogClose}/>
            }
        </>
    );
});

const DepartmentListImpl:FC<{
    args: Args,
    list: FragmentKeyOf<typeof DEPARTMENT_LIST_FRAGMENT>
}> = memo(({args, list}) => {

    /* 
     * Relay temporarily does not support to display rows of current page. Please see 
     * "Relay is still working on a solution" at "Custom Connection State -> Rendering One Page of Items at a Time" in 
     * https://relay.dev/docs/guided-tour/list-data/advanced-pagination/
     * 
     * So "useTypedRefetchableFragment" is used here, not "useTypedPaginationFragment"
     */
    const { 
        data, refetch, loadNext, loadPrevious, hasNext, hasPrevious, isLoadingNext, isLoadingPrevious 
    } = useTypedPaginationFragment(DEPARTMENT_LIST_FRAGMENT, list);

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
                        <DepartmentRow row={edge.node}/>
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

interface Args extends BusinessArgs<QueryArgs["findDepartmentsLikeName"]> {
    readonly refresh: number;
}