import { css } from "@emotion/css";

export const LABEL_CSS = css({
    color: "gray"
});

export const TAG_CSS = css({
    display: 'inline-block', 
    border: "dotted 1px gray", 
    margin: ".5rem",
    padding: ".2rem",
    borderRadius: ".3rem"
});

export const FORM_CSS = css({
    "&>div": {
        display: "flex",
        margin: ".5rem 0 .5rem 0",
        "&>div:first-child": {
            textAlign: "right",
            color: "gray",
            width: "33.33333%",
            marginRight: "1rem"
        }
    }
});

export const ERROR_CSS = css({
    color: "red"
});