import { FC, memo } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { department$$, employee$, employee$$ } from "../__generated/fetchers";
import { ModelType } from "graphql-ts-client-api";
import { useCallback } from "react";
import { EmployeeInput } from "../__generated/inputs";
import { useEffect } from "react";
import UUIDClass from "uuidjs";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { EmployeeSelect } from "./EmployeeSelect";

export const EMPLOYEE_EDITING_INFO = 
    employee$$
    .department(
        department$$
    )
    .supervisor(
        employee$.id
    );

export const EmployeeDialog: FC<{
    value?: ModelType<typeof EMPLOYEE_EDITING_INFO>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [form] = useForm<Partial<EmployeeInput>>();

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

    const onOk = useCallback(() => {
        onClose();
    }, [onClose]);

    const onCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Modal
        visible={true}
        title={`${value === undefined ? 'Create' : 'Modify'} employee`}
        onOk={onOk}
        onCancel={onCancel}>
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