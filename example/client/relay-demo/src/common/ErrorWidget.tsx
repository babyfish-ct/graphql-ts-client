import { css, cx } from "@emotion/css";
import { FC, memo } from "react";

export const ErrorWidget: FC<{
    error?: Error
}> = memo(({error}) => {

    const messages = error !== undefined ?
        (error as any).source?.errors?.map((err: any) => err.message) ?? [error.message] :
        [];

    return (
        <div className={cx({
            [css({ color: "red"})]: error !== undefined
        })}>
            { messages.length === 1 && messages[0] }
            { messages.length > 1 &&
                <ul>
                    {messages.map((message: any) => message)}
                </ul>
            }
        </div>
    );
});