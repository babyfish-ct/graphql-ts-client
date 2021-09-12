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
import { createTypedMutation, OperationResponseOf, useTypedMutation, getConnection } from "../__generated";
import { ConnectionHandler, RecordSourceSelectorProxy, Variables } from "relay-runtime";
import { CONNECTION_KEY_ROOT_EMPLOYEE_LIST } from "./EmployeeList";
import { WINDOW_PAGINATION_HANDLER } from "../common/Environment";
import { useState } from "react";
import { ErrorWidget } from "../common/ErrorWidget";
import { refreshFragment } from "../common/RefreshFragment";

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
    listFilter: Variables,
    value?: ModelType<typeof EMPLOYEE_EDITING_INFO>,
    onClose: () => void
}> = memo(({listFilter, value, onClose}) => {

    const [form] = useForm<Partial<EmployeeInput>>();

    const [merge, merging] = useTypedMutation(EMPLOYEE_MERGE_MUTATION);
    const [error, setError] = useState<Error>();

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
        sharedUpdater(store, listFilter, value);
    }, [listFilter, value]);

    const onOk = useCallback(async () => {
        let input: EmployeeInput;
        try {
            input = await form.validateFields() as EmployeeInput; 
        } catch {
            console.log("EmployeeDialog validation error");
            return;
        }
        setError(undefined);
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
            onCompleted: response => {
                complete(response, value);
                onClose();
            },
            onError: error => {
                setError(error);
            }
        });
    }, [form, merge, onClose, updater, value]);

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
                    <Input  autoComplete="off"/>
                </Form.Item>
                <Form.Item name="lastName" label="Last Name" rules={[{required: true, message: "Please input last name"}]}>
                    <Input  autoComplete="off"/>
                </Form.Item>
                <Form.Item name="gender" label="Gender" rules={[{required: true, message: "Please choose gender"}]}>
                    <Select>
                        <Select.Option value="MALE">Male</Select.Option>
                        <Select.Option value="FEMALE">Female</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="salary" label="Salary" rules={[{required: true, message: "Please input salary"}]}>
                    <InputNumber/>
                </Form.Item>
                <Form.Item name="departmentId" label="Department" rules={[{required: true, message: "Please choose department"}]}>
                    <DepartmentSelect/>
                </Form.Item>
                <Form.Item name="supervisorId" label="Supervisor">
                    <EmployeeSelect optional={true}/>
                </Form.Item>
            </Form>
            <ErrorWidget error={error}/>
        </Modal>
    );
});

function sharedUpdater(
    store: RecordSourceSelectorProxy<OperationResponseOf<typeof EMPLOYEE_MERGE_MUTATION>>, 
    listFilter: Variables,
    oldEmployee?: ModelType<typeof EMPLOYEE_EDITING_INFO>
) {
    const newEmployeeRecord = store.getRootField("mergeEmployee");
    
    if (oldEmployee === undefined) { // Create new employee
        const listConnection = getConnection(
            store.getRoot(), 
            {
                key: CONNECTION_KEY_ROOT_EMPLOYEE_LIST,
                handler: WINDOW_PAGINATION_HANDLER
            },
            listFilter
        );
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
                store.get(oldDepartmentId)?.setLinkedRecords(
                    employeeRecords.filter(rec => rec.getDataID() !== oldEmployee?.id), 
                    "employees"
                );
            }
        }
        const employeeRecords = store.get(newDepartmentId)?.getLinkedRecords("employees");
        if (employeeRecords) {
            store.get(newDepartmentId)?.setLinkedRecords(
                [...employeeRecords, newEmployeeRecord],
                "employees"
            )
        }
    }

    const oldSupervisorId = oldEmployee?.supervisor?.id;
    const newSupervisorId = newEmployeeRecord.getLinkedRecord("supervisor")?.getDataID();
    if (oldSupervisorId !== newSupervisorId) {
        if (oldSupervisorId !== undefined) {
            const subordinateRecords = store.get(oldSupervisorId)?.getLinkedRecords("subordinates");
            if (subordinateRecords) {
                store.get(oldSupervisorId)?.setLinkedRecords(
                    subordinateRecords.filter(rec => rec.getDataID() !== oldEmployee?.id),
                    "subordinates"
                )
            }
        }
        if (newSupervisorId !== undefined) {
            const subordinateRecords = store.get(newSupervisorId)?.getLinkedRecords("subordinates");
            if (subordinateRecords) {
                store.get(newSupervisorId)?.setLinkedRecords(
                    [...subordinateRecords, newEmployeeRecord],
                    "subordinates"
                )
            }
        }
    }
}

function complete(
    response: OperationResponseOf<typeof EMPLOYEE_MERGE_MUTATION>, 
    oldEmployee?: ModelType<typeof EMPLOYEE_EDITING_INFO>
) {
    const newEmployee = response.mergeEmployee;
    const oldDepartmentId = oldEmployee?.department?.id;
    const newDepartmentId = newEmployee.department.id;
    const oldSalary = oldEmployee?.salary;
    const newSalary = newEmployee.salary;
    if (oldDepartmentId !== newDepartmentId || oldSalary !== newSalary) {
        if (oldDepartmentId !== undefined && oldDepartmentId !== newDepartmentId) {
            refreshFragment(oldDepartmentId);
        }
        refreshFragment(newDepartmentId);
    }
}