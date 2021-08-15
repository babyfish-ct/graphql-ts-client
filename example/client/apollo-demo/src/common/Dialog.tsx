import { css } from "@emotion/css";
import { FC, memo, PropsWithChildren } from "react";

export const Dialog: FC<
    PropsWithChildren<{
    title: string
    }>
> = memo(({title, children}) => {
    return (
        <div className={css({
            position: "fixed",
            display: "flex",
            justifyContent: "center",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        })}>
            <div className={css({
                opacity: .3,
                backgroundColor: "black",
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            })}>
            </div>
            <div className={css({
                boxShadow: "0px 0px 1rem lightgray",
                border: "solid 1px lightgray",
                borderRadius: ".5rem",
                opacity: 1,
                minWidth: "50%",
                backgroundColor: "white",
                position: "absolute",
                top: 100,
                zIndex: 9,
            })}>
                <div className={css({flex: 1, fontsize: "1.5rem", padding: "1rem", borderBottom: "solid 1px lightgray", fontWeight: "bold"})}>
                    {title}
                </div>
                <div className={css({padding: "1rem"})}>
                    {children}
                </div>
            </div>
        </div>
    );
})