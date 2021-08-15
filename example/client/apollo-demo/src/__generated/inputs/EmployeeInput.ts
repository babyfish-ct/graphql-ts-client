/*
 * This input type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' of recoil
 */
export type EmployeeInput = {
	readonly id: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly gender: string;
	readonly salary: number;
	readonly departmentId: string;
	readonly supervisorId?: string;
}
