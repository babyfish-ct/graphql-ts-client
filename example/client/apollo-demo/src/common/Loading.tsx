import { css, cx, keyframes } from "@emotion/css";
import { FC, memo } from "react";
import loading from "./loading.svg";

export const Loading: FC<{
    title?: string,
    mode?: "INLINE" | "INLINE_TINY" | "FLOAT"
}> = memo(({title = "Loading...", mode = "INLINE"}) => {
    return (
        <div className={cx({
            [css({position: 'relative'})]: mode === 'FLOAT', 
            [css({display: "inline-block"})]: mode === 'INLINE_TINY'
        })}>
            <div className={cx({
                [css({
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "2rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 100
                })]: mode === 'FLOAT'
            })}>
                <div className={cx({
                    [css({
                        padding: "1rem",
                        backgroundColor: "white",
                        boxShadow: "0px 0px 1rem lightblue",
                        border: "solid 1px lightblue",
                        borderRadius: ".5rem"
                    })]: mode === 'FLOAT'
                })}>
                    <div className={css({display: "flex"})}>
                        <div>
                            <img src={loading} height={mode === 'INLINE_TINY' ? 20 : 60} className={ANIMATION_CSS}/>
                        </div>
                        {
                            mode === 'INLINE_TINY' ?
                            <span>{title}</span> :
                            <h2>{title}</h2>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
});

const ANIMATION_KEY_FRAMES = keyframes`
from {
    transform: rotate(0deg);
}
to {
    transform: rotate(360deg);
}`;

const ANIMATION_CSS = css({
    animation: `${ANIMATION_KEY_FRAMES} infinite 1s linear`
});


