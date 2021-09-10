import { FC, memo } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { department$, employee$, employee$$, mutation$ } from "../__generated/fetchers";
import { ModelType } from "graphql-ts-client-api";
import { useCallback } from "react";
import { EmployeeInput } from "../__generated/inputs";
import { useEffect } from "react";
import UUIDClass from "uuidjs";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS, EmployeeSelect } from "./EmployeeSelect";
import { createTypedMutation, OperationResponseOf, useTypedMutation } from "../__generated";
import { ConnectionHandler, RecordSourceSelectorProxy } from "relay-runtime";
import { getConnection } from "../__generated/Relay";
import { CONNECTION_KEY_ROOT_EMPLOYEE_LIST } from "./EmployeeList";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";

export const EMPLOYEE_EDITING_INFO = 
    employee$$
    .department(
        department$.id
    )
    .supervisor(
        employee$.id
    );

const EMPLOYEE_MERGE_MUTATION = createTypedMutation(
    "EmployeeMergeMutation",
    mutation$
    .mergeEmployee(
        EMPLOYEE_EDITING_INFO
        .on( // Use inline-fragment to add "subordniates" because EmployeeList requires it
            employee$.subordinates(
                employee$.id.firstName.lastName
            )
        )
    )
    /*
     * The field 'mergeDepartment' has arguments(implicitly here), @appendNode cannot work with it. 
     * I do not intend to use @appendNode to make the returned data type has an extra wrapper structure, so I use updater directly in the code
     */
);

export const EmployeeDialog: FC<{
    value?: ModelType<typeof EMPLOYEE_EDITING_INFO>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [form] = useForm<Partial<EmployeeInput>>();

    const [merge, merging] = useTypedMutation(EMPLOYEE_MERGE_MUTATION);

    useEffect(() => {
        if (value === undefined) {
            form.setFieldsValue({id: UUIDClass.generate()});
        } else {
            form.setFieldsValue({
                id: value.id,
                firstName: value.firstName,
                lastName: value.lastName,
                gender: value.gender,
                salary: value.salary,
                departmentId: value.department.id,
                supervisorId: value.supervisor?.id
            });
        }
    }, [value, form]);

    const updater = useCallback((store: RecordSourceSelectorProxy<OperationResponseOf<typeof EMPLOYEE_MERGE_MUTATION>>) => {
        sharedUpdater(store, value);
    }, [value]);

    const onOk = useCallback(async () => {
        let input: EmployeeInput;
        try {
            input = await form.validateFields() as EmployeeInput; 
        } catch {
            console.log("EmployeeDialog validation error");
            return;
        }
        merge({
            variables: { input },
            optimisticResponse: {
                mergeEmployee: {
                    id: input.id,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    gender: input.gender,
                    salary: input.salary,
                    department: { id: input.departmentId },
                    supervisor: { id: input.supervisorId },
                    subordinates: []
                }
            },
            optimisticUpdater: updater,
            updater: updater,
            onCompleted: () => {
                onClose();
            }
        });
    }, [form, merge, onClose, updater]);

    const onCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
        visible={true}
        title={`${value === undefined ? 'Create' : 'Modify'} employee`}
        onOk={onOk}
        onCancel={onCancel}
        okButtonProps={{loading: merging}}>
            <Form form={form} labelCol={{xs: 8}} wrapperCol={{xs: 16}}>
                <Form.Item name="id" hidden={true}/>
                <Form.Item name="firstName" label="First Name" rules={[{required: true, message: "Please input first name"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="lastName" label="Last Name" rules={[{required: true, message: "Please input last name"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="gender" label="Gender">
                    <Select>
                        <Select.Option value="MALE">Male</Select.Option>
                        <Select.Option value="FEMALE">Female</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="salary" label="Salary" rules={[{required: true, message: "Please input salary"}]}>
                    <InputNumber/>
                </Form.Item>
                <Form.Item name="departmentId" label="Department" rules={[{required: true, message: "Please choose a department"}]}>
                    <DepartmentSelect/>
                </Form.Item>
                <Form.Item name="supervisorId" label="Supervisor">
                    <EmployeeSelect optional={true}/>
                </Form.Item>
            </Form>
        </Modal>
    );
});

function sharedUpdater(
    store: RecordSourceSelectorProxy<OperationResponseOf<typeof EMPLOYEE_MERGE_MUTATION>>, 
    oldEmployee?: ModelType<typeof EMPLOYEE_EDITING_INFO> 
) {
    const newEmployeeRecord = store.getRootField("mergeEmployee");
    
    if (oldEmployee === undefined) { // Create new employee
        const listConnection = getConnection(store.getRoot(), {
            key: CONNECTION_KEY_ROOT_EMPLOYEE_LIST,
            handler: WINDOW_PAGINATION_HANDLER
        });
        if (listConnection !== undefined) {
            ConnectionHandler.insertEdgeAfter(
                listConnection,
                ConnectionHandler.createEdge(store, listConnection, newEmployeeRecord, employee$.fetchableType.entityName)
            );
        }
        const optionsConnection = getConnection(store.getRoot(), CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS);
        if (optionsConnection !== undefined) {
            ConnectionHandler.insertEdgeAfter(
                optionsConnection,
                ConnectionHandler.createEdge(store, optionsConnection, newEmployeeRecord, employee$.fetchableType.entityName)
            );
        }
    }

    const oldDepartmentId = oldEmployee?.department?.id;
    const newDepartmentId = newEmployeeRecord.getLinkedRecord("department").getDataID();
    if (oldDepartmentId !== newDepartmentId) {
        if (oldDepartmentId !== undefined) {
            const employeeRecords = store.get(oldDepartmentId)?.getLinkedRecords("employees");
            if (employeeRecords) {
                store.get(oldDepartmentId)!.setLinkedRecords(
                    employeeRecords.filter(rec => rec.getDataID() !== oldDepartmentId), 
                    "employees"
                );
            }
        }
        const employeeRecords = store.get(newDepartmentId)?.getLinkedRecords("employees");
        if (employeeRecords) {
            store.get(newDepartmentId)!.setLinkedRecords(
                [...employeeRecords, newEmployeeRecord],
                "employees"
            )
        }
    }

    const oldSupervisorId = oldEmployee?.supervisor?.id;
    const newSupervisorId = newEmployeeRecord.getLinkedRecord("supervisor")?.getDataID();
    if (oldSupervisorId !== newSupervisorId) {
        if (oldSupervisorId !== undefined) {
            const suborinates = store.get(oldSupervisorId)?.getLinkedRecords("suborinates");
            if (suborinates) {
                store.get(oldSupervisorId)!.setLinkedRecords(
                    suborinates.filter(rec => rec.getDataID() !== oldSupervisorId),
                    "subordinates"
                )
            }
        }
        if (newSupervisorId !== undefined) {
            const suborinates = store.get(newSupervisorId)?.getLinkedRecords("suborinates");
            if (suborinates) {
                store.get(newSupervisorId)!.setLinkedRecords(
                    [...suborinates, newEmployeeRecord],
                    "subordinates"
                )
            }
        }
    }
}