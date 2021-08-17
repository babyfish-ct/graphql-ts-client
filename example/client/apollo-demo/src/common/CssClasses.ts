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
        flexWrap: "nowrap",
        margin: ".5rem 0 .5rem 0",
        "&>div:first-child": {
            textAlign: "right",
            color: "gray",
            width: "140px",
            marginRight: "1rem",
            whiteSpace: "nowrap"
        }
    }
});

export const ERROR_CSS = css({
    color: "red"
});