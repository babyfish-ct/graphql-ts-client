import { Form, Input, Modal } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModelType } from "graphql-ts-client-api";
import { useEffect } from "react";
import { useCallback } from "react";
import { FC, memo } from "react";
import { ConnectionHandler, RecordSourceSelectorProxy, Variables } from "relay-runtime";
import UUIDClass from "uuidjs";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { OperationResponseOf, useTypedMutation, createTypedMutation, getConnection } from "../__generated";
import { department$, department$$, departmentEdge$, employee$, mutation$ } from "../__generated/fetchers";
import { DepartmentInput } from "../__generated/inputs";
import { CONNECTION_KEY_ROOT_DEPARTMENT_LIST } from "./DepartmentList";
import { CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS } from "./DepartmentSelect";

export const DEPARTMENT_EDITING_INFO = department$$;

const DEPARTMENT_MERGE_MUTATION = createTypedMutation(
    "DepartmentMergeMutation",
    mutation$
    .mergeDepartment(
        DEPARTMENT_EDITING_INFO
        .on( // Use inline-fragment to add "employees" because DepartemntList requires it
            department$.employees(
                employee$.id.firstName.lastName
            )
        )
    ) 
    /*
     * The field 'mergeDepartment' has arguments(implicitly here), @appendNode cannot work with it. 
     * I do not intend to use @appendNode to make the returned data type has an extra wrapper structure, so I use updater directly in the code
     */
);

export const DepartemntDialog: FC<{
    listFilter: Variables,
    value?: ModelType<typeof DEPARTMENT_EDITING_INFO>,
    onClose: () => void
}> = memo(({listFilter, value, onClose}) => {

    const [form] = useForm<Partial<DepartmentInput>>();

    const [merge, merging] = useTypedMutation(DEPARTMENT_MERGE_MUTATION);
    
    useEffect(() => {
        if (value === undefined) {
            form.setFieldsValue({id: UUIDClass.generate()});
        } else {
            form.setFieldsValue({
                id: value.id,
                name: value.name
            });
        }
    }, [value, form]);

    const updater = useCallback((store: RecordSourceSelectorProxy<OperationResponseOf<typeof DEPARTMENT_MERGE_MUTATION>>) => {
        sharedUpdater(store, listFilter, value);
    }, [listFilter, value]);

    const onOk = useCallback(async () => {
        let input: DepartmentInput;
        try {
            input = await form.validateFields() as DepartmentInput;
        } catch (ex) {
            console.log("DepartmentDialog validation error");
            return;
        }
        
        merge({
            variables: { 
                input,
            },
            onCompleted: response => {
                onClose();
            },
            onError: () => {
                Modal.error({
                    type: "error",
                    content: `Failed to ${value === undefined ? "create" : "update"} department`
                })
            },
            optimisticResponse: {
                mergeDepartment: {
                    id: input.id,
                    name: input.name,
                    employees: []
                }
            },
            optimisticUpdater: updater,
            updater
        });
    }, [form, merge, onClose, value, updater]);

    const onCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
        visible={true}
        title={`${value !== undefined ? 'Modify' : 'Create'} department`}
        onOk={onOk}
        onCancel={onCancel}
        okButtonProps={{loading: merging}}>
            <Form form={form}>
                <Form.Item name="id" hidden={true} preserve={true}/>
                <Form.Item name="name" label="Name" rules={[{required: true, message: 'Name is required'}]}>
                    <Input autoComplete="off"/>
                </Form.Item>
            </Form>
        </Modal>
    );
});

function sharedUpdater(
    store: RecordSourceSelectorProxy<OperationResponseOf<typeof DEPARTMENT_MERGE_MUTATION>>, 
    listFilter: Variables,
    oldDepartment?: ModelType<typeof DEPARTMENT_EDITING_INFO>
) {
    if (oldDepartment === undefined) {
        const newDpartmentRecord = store.getRootField("mergeDepartment");
        const listConnection = getConnection(
            store.getRoot(), 
            { 
                key: CONNECTION_KEY_ROOT_DEPARTMENT_LIST, 
                handler: WINDOW_PAGINATION_HANDLER 
            },
            listFilter
        );
        if (listConnection !== undefined) {
            ConnectionHandler.insertEdgeAfter(
                listConnection,
                ConnectionHandler.createEdge(store, listConnection, newDpartmentRecord, departmentEdge$.fetchableType.name)
            );
        }
        const optionsConnection = getConnection(store.getRoot(), CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS);
        if (optionsConnection !== undefined) {
            ConnectionHandler.insertEdgeAfter(
                optionsConnection,
                ConnectionHandler.createEdge(store, optionsConnection, newDpartmentRecord, employee$.fetchableType.name)
            );
        }
    }
}