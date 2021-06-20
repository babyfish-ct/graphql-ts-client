/*
 * This input type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' or recoil
 */
export type EmployeeInput = {
	readonly id: number;
	readonly firstName: string;
	readonly lastName: string;
	readonly gender: string;
	readonly salary: number;
	readonly departmentId: number;
	readonly supervisorId?: number;
}
