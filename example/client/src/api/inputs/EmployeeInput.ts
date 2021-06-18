import {Gender} from '../enums';

export interface EmployeeInput {
	readonly departmentId: number;
	readonly gender: Gender;
	readonly name: string;
	readonly salary: number;
	readonly supervisorId?: number;
}
