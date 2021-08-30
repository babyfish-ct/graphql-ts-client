import { FC, memo, Suspense } from "react";
import { EmployeeList } from "./EmployeeList";

export const Demo: FC = memo(() => {
    return (
        <>
            <h1>useTypedFragment</h1>
            <Suspense fallback={<div>Loading employee list...</div>}>
                <EmployeeList/>
            </Suspense>
        </>
    );
});