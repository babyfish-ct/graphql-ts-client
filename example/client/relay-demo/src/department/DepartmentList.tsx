import { css } from "@emotion/css";
import { Button, List, Space, Spin, Form, Input } from "antd";
import { useState } from "react";
import { ChangeEvent, Suspense, useCallback } from "react";
import { FC, memo } from "react";
import { DEFAULT_PAGE_SIZE } from "../common/Constants";
import { FULL_WIDTH } from "../common/Styles";
import { createTypedFragment, createTypedQuery, loadTypedQuery, PreloadedQueryOf, useTypedPaginationFragment, useTypedPreloadedQuery, useTypedQueryLoader, OperationVariablesOf } from "../__generated";
import { query$ } from "../__generated/fetchers/QueryFetcher";
import { DepartemntDialog } from "./DepartmentDialog";
import { DepartmentRow, DEPARTMENT_ROW_FRAGMENT } from "./DepartmentRow";
import { department$, departmentConnection$, departmentEdge$ } from "../__generated/fetchers";
import { environment, WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { BusinessArgs } from "../common/BusinessArgs";

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

    const [queryReference, refetch] = useTypedQueryLoader(DEPARTMENT_LIST_QUERY, DEPARRTMENT_LIST_INITIAL_QUERY_REFERENCE);

    const [dialog, setDialog] = useState(false);

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const name = value !== "" ? value : undefined;
        refetch({...queryReference!.variables, name}, {fetchPolicy: 'network-only'});
    }, [refetch, queryReference]);

    const onRefreshClick = useCallback(() => {
        refetch(queryReference!.variables, {fetchPolicy: 'network-only'});
    }, [refetch, queryReference]);

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
                        <Input value={queryReference?.variables?.name} onChange={onNameChange}/>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={onRefreshClick}>Refresh</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={onAddDepartmentClick}>Add Department...</Button>
                    </Form.Item>
                </Form>
                <Suspense fallback={<Spin tip="Refetch departments..."/>}>
                    <DepartmentPagination queryReference={queryReference!}/>
                </Suspense>
            </Space>
            {
                dialog &&
                <DepartemntDialog listFilter={extractBusinessArgs(queryReference!)} onClose={onDialogClose}/>
            }
        </>
    );
});

const DepartmentPagination:FC<{
    queryReference: PreloadedQueryOf<typeof DEPARTMENT_LIST_QUERY>
}> = memo(({queryReference}) => {

    const list = useTypedPreloadedQuery(DEPARTMENT_LIST_QUERY, queryReference);

    /* 
     * Relay temporarily does not support to display rows of current page. Please see 
     * "Relay is still working on a solution" at "Custom Connection State -> Rendering One Page of Items at a Time" in 
     * https://relay.dev/docs/guided-tour/list-data/advanced-pagination/
     * 
     * So "useTypedRefetchableFragment" is used here, not "useTypedPaginationFragment"
     */
    const { 
        data, loadNext, loadPrevious, hasNext, hasPrevious, isLoadingNext, isLoadingPrevious 
    } = useTypedPaginationFragment(DEPARTMENT_LIST_FRAGMENT, list);

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
                        <DepartmentRow listFilter={extractBusinessArgs(queryReference)} row={edge.node}/>
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

function extractBusinessArgs(
    queryReference: PreloadedQueryOf<typeof DEPARTMENT_LIST_QUERY>
): BusinessArgs<OperationVariablesOf<typeof DEPARTMENT_LIST_QUERY>> {
    return {
        name: queryReference.variables.name
    };
}