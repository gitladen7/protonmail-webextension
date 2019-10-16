import React from "react";
import Icon, { IconName } from "./icon";

type Position = "left" | "top" | "bottom" | "right";

interface ButtonProps {
    onClick: () => void;
    label?: string;
    color?: "none" | "primary" | "danger";
    disabled?: boolean;
    icon?: IconName;
    badge?: string;
    badgePosition?: Position
    tooltip?: string;
    tooltipPosition?: Position;
    visible?: boolean;
}

const Button: React.FC<ButtonProps> = (props) => {
    if (props.visible === false) {
        return null;
    }

    const classes = ["button"];
    if (props.color !== "none") {
        if (props.color === "primary" || props.color === undefined) {
            classes.push("is-primary");
        } else if (props.color === "danger") {
            classes.push("is-danger");
        }
    }

    if (props.badge) {
        classes.push("has-badge-danger has-badge-rounded");
        if (props.badgePosition === "left" || props.badgePosition === undefined) {
            classes.push("has-badge-left");
        } else if (props.badgePosition === "top") {
            classes.push("has-badge-top");
        } else if (props.badgePosition === "bottom") {
            classes.push("has-badge-bottom");
        } else if (props.badgePosition === "right") {
            classes.push("has-badge-right");
        }
    }

    if (props.tooltip) {
        classes.push("has-tooltip");
        if (props.tooltipPosition === "left") {
            classes.push("has-tooltip-left");
        } else if (props.tooltipPosition === "top") {
            classes.push("has-tooltip-top");
        } else if (props.tooltipPosition === "bottom") {
            classes.push("has-tooltip-bottom");
        } else if (props.tooltipPosition === "right") {
            classes.push("has-tooltip-right");
        }
    }

    return (<button
        onClick={(ev) => { ev.preventDefault(); props.onClick(); }}
        className={classes.join(" ")}
        disabled={props.disabled}
        data-tooltip={props.tooltip}
        data-badge={props.badge}>
        {props.icon &&
            <Icon icon={props.icon} />}
        {props.label && <span>{props.label}</span>}
    </button>);
};

export default React.memo(Button);
