import { Form, Input, Modal } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModelType } from "graphql-ts-client-api";
import { useEffect } from "react";
import { useCallback } from "react";
import { FC, memo } from "react";
import { ConnectionHandler, RecordSourceSelectorProxy } from "relay-runtime";
import UUIDClass from "uuidjs";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { OperationResponseOf, useTypedMutation } from "../__generated";
import { department$$, departmentEdge$, mutation$ } from "../__generated/fetchers";
import { DepartmentInput } from "../__generated/inputs";
import { createTypedMutation, getConnection } from "../__generated/Relay";
import { CONNECTION_KEY_ROOT_DEPARTMENT_LIST } from "./DepartmentList";

export const DEPARTMENT_EDITING_INFO = department$$;

const DEPARTMENT_MERGE_MUTATION = createTypedMutation(
    "DepartmentMergeMutation",
    mutation$
    .mergeDepartment(
        DEPARTMENT_EDITING_INFO
    ) 
    /*
     * The field 'mergeDepartment' has arguments(implicitly here), @appendNode cannot work with it. 
     * I do not intend to use @appendNode to make the returned data type has an extra wrapper structure, so I use updater directly in the code
     */
);

export const DepartemntDialog: FC<{
    value?: ModelType<typeof DEPARTMENT_EDITING_INFO>,
    onClose: (value?: ModelType<typeof DEPARTMENT_EDITING_INFO>) => void
}> = memo(({value, onClose}) => {

    const [form] = useForm<Partial<DepartmentInput>>();

    const [mutate, mutating] = useTypedMutation(DEPARTMENT_MERGE_MUTATION);
    
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
        sharedUpdater(store, value === undefined);
    }, [value]);

    const onOk = useCallback(async () => {
        let input: DepartmentInput;
        try {
            input = (await form.validateFields()) as DepartmentInput;
        } catch (ex) {
            console.log("DepartmentDialog validation error");
            return;
        }
        
        mutate({
            variables: { 
                input,
            },
            onCompleted: response => {
                onClose(response.mergeDepartment)
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
                    name: input.name
                }
            },
            optimisticUpdater: updater,
            updater
        });
    }, [form, mutate, onClose, value, updater]);

    const onCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
        visible={true}
        title={`${value !== undefined ? 'Modify' : 'Create'} department`}
        onOk={onOk}
        onCancel={onCancel}
        okButtonProps={{loading: mutating}}>
            <Form form={form}>
                <Form.Item name="id" hidden={true} preserve={true}/>
                <Form.Item label="Name" name="name" rules={[{required: true, message: 'Name is required'}]}>
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
});

function sharedUpdater(store: RecordSourceSelectorProxy<OperationResponseOf<typeof DEPARTMENT_MERGE_MUTATION>>, createMode: boolean) {
    const result = store.getRootField("mergeDepartment");
    if (!result.getLinkedRecords("employes")) {
        result.setLinkedRecords([], "employees");
    }
    if (createMode) {
        const connection = getConnection(store.getRoot(), { 
            key: CONNECTION_KEY_ROOT_DEPARTMENT_LIST, 
            handler: WINDOW_PAGINATION_HANDLER 
        });
        if (connection !== undefined) {
            ConnectionHandler.insertEdgeAfter(
                connection,
                ConnectionHandler.createEdge(store, connection, result, departmentEdge$.fetchableType.entityName)
            );
        }
    }
}