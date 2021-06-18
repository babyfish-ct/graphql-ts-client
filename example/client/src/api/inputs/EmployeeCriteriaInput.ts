import {Gender} from '../enums';

export interface EmployeeCriteriaInput {
	readonly departmentIds?: number[];
	readonly gender?: Gender;
	readonly maxSalary?: number;
	readonly minSalary?: number;
	readonly name?: string;
}
