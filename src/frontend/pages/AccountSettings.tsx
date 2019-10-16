import React, { useState } from "react";
import { IProtonAccount } from "../../shared/store/accounts/types";
import Button from "../components/button";
import CheckboxField from "../components/checkboxField";
import { _ } from "../../shared/i18n";
import PersistWarning from "./PersistWarning";

interface AccountSettingsProps {
    account: IProtonAccount;
    editAccount: (obj: Partial<IProtonAccount>) => void;
    deleteAccount: () => void;
    onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = (props) => {
    const [persistWarningOpen, setPersistWarningOpen] = useState(false);
    if (persistWarningOpen) {
        return <PersistWarning
            onClose={() => setPersistWarningOpen(false)}
            onAccept={() => {
                props.editAccount({
                    persistToDisk: true,
                });
                setPersistWarningOpen(false);
            }}
            email={props.account.email}
        />;
    }

    return (
        <div className="account-settings page">
            <div className="popup-header">
                <div className="popup-header-title">
                    {_("accountSettings_title", [props.account.email])}
                </div>
            </div>
            <div className="account-settings-body">
                <CheckboxField
                    id={"persist"}
                    label={_("accountSettings_persist_label")}
                    value={props.account.persist}
                    onChange={(newValue) => props.editAccount({
                        persist: newValue,
                    })}
                />
                <CheckboxField
                    id={"persistToDisk"}
                    label={_("accountSettings_persistToDisk_label")}
                    value={props.account.persistToDisk && props.account.persist}
                    onChange={(newValue) => (props.account.persistToDisk === true || setPersistWarningOpen(true)) &&
                        props.editAccount({
                            persistToDisk: newValue,
                        })}
                />
                <CheckboxField
                    id={"showBadge"}
                    label={_("accountSettings_badge_label")}
                    value={props.account.showUnreadCountBadge}
                    onChange={(newValue) => props.editAccount({
                        showUnreadCountBadge: newValue,
                    })}
                />
                <CheckboxField
                    id={"notify"}
                    label={_("accountSettings_notifications_label")}
                    value={props.account.notify}
                    onChange={(newValue) => props.editAccount({
                        notify: newValue,
                    })}
                />
                <CheckboxField
                    id={"peeking"}
                    label={_("accountSettings_peeking_label")}
                    value={props.account.peeking}
                    onChange={(newValue) => props.editAccount({
                        peeking: newValue,
                    })}
                />
                <CheckboxField
                    id={"hide"}
                    label={_("accountSettings_hide_label")}
                    value={props.account.hidden}
                    onChange={(newValue) => props.editAccount({
                        hidden: newValue,
                    })}
                />
                {props.account.sessionExpired && <article className="field message is-danger">
                    <div className="message-header">
                        {_("accountSettings_expired_title")}
                        <button className="delete" onClick={() => props.editAccount({
                            sessionExpired: false,
                        })}></button>
                    </div>
                    <div className="message-body">
                        {_("accountSettings_expired_body")}
                    </div>
                </article>}
            </div>
            <div className="popup-footer">
                <div className="buttons">
                    <Button
                        visible={props.account.sessions.length !== 0}
                        onClick={() => props.editAccount({
                            sessions: [],
                        })}
                        label={_("accountSettings_button_clear")}
                        color="danger"
                    />
                    <Button
                        onClick={() => props.deleteAccount()}
                        label={_("accountSettings_button_delete")}
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

export default AccountSettings;
