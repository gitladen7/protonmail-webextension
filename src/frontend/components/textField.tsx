import React from "react";

interface TextFieldProps {
    visible?: boolean;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label?: string;
}

const TextField: React.FC<TextFieldProps> = (props) => {
    if (props.visible === false) {
        return null;
    }

    return (<div className="field">
        {props.label && <label className="label">{props.label}</label>}
        <div className="control">
            <input className="input" type="text" value={props.value} onChange={(ev) =>
                props.onChange(
                    ev.target.value,
                )} placeholder={props.placeholder} />
        </div>
    </div>);
};

export default React.memo(TextField);
