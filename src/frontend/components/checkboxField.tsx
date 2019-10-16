import React from "react";

interface CheckboxFieldProps {
    visible?: boolean;
    disabled?: boolean;
    value: boolean;
    onChange: (val: boolean) => void;
    label?: string;
    preLabel?: string;
    id: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = (props) => {
    if (props.visible === false) {
        return null;
    }

    return (<div className="field">
        {props.preLabel && <label className="label">{props.preLabel}</label>}
        <div className="control noselect">
            <input id={props.id} type="checkbox" className="switch is-rounded"
                checked={props.value}
                onChange={(ev) => props.onChange(ev.target.checked)}
                disabled={props.disabled}
            />
            {props.label && <label htmlFor={props.id}>{props.label}</label>}
        </div>
    </div>);
};

export default React.memo(CheckboxField);
