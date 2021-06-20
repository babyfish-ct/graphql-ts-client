/*
 * This input type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' or recoil
 */
export type DepartmentInput = {
	readonly id: number;
	readonly name: string;
}
