export interface EmployeeInput {
	readonly id: number;
	readonly firstName: string;
	readonly lastName: string;
	readonly gender: string;
	readonly salary: number;
	readonly departmentId: number;
	readonly supervisorId?: number;
}
