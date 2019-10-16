import React from "react";
import Button from "../components/button";
import { _ } from "../../shared/i18n";

interface PersistWarningProps {
    onClose: () => void;
    onAccept: () => void;
    email: string;
}

const PersistWarning: React.FC<PersistWarningProps> = (props) => {
    return (
        <div className="account-settings page">
            <div className="popup-header">
                <div className="popup-header-title">
                    {_("accountSettings_title", [props.email])}
                </div>
            </div>
            <div className="account-settings-body">
                <article className="message is-danger">
                    <div className="message-body">
                        {_("accountSettings_persistWarning", [props.email])}
                    </div>
                </article>
            </div>
            <div className="popup-footer">
                <div className="buttons">
                    <Button
                        onClick={() => props.onAccept()}
                        label={_("accountSettings_acceptWarning")}
                        color="danger"
                    />
                </div>
                <div className="buttons">
                    <Button
                        onClick={() => props.onClose()}
                        label={_("button_goBack")}
                    />
                </div>
            </div>
        </div>
    );
};

export default PersistWarning;
