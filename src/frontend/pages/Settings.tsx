import React, { useState, useEffect } from "react";
import { ISettings } from "../../shared/store/settings/types";
import { protonDomains } from "../../shared/protonDomains.js";
import Button from "../components/button";
import TextField from "../components/textField";
import CheckboxField from "../components/checkboxField";
import { _, availableLanguages } from "../../shared/i18n";

interface SettingsProps {
    onClose: () => void;
    editSettings: (obj: Partial<ISettings>) => void;
    settings: ISettings;
}

const Settings: React.FC<SettingsProps> = (props) => {
    const [expandNotificationsSettings, setExpandNotificationsSettings] = useState(false);
    useEffect(() => {
        if (props.settings.singleNotificationTitle === "") {
            props.editSettings({
                singleNotificationTitle: _("notification_single_title"),
            });
        }
        if (props.settings.singleNotificationMessage === "") {
            props.editSettings({
                singleNotificationMessage: _("notification_single_message"),
            });
        }
        if (props.settings.multipleNotificationTitle === "") {
            props.editSettings({
                multipleNotificationTitle: _("notification_multiple_title"),
            });
        }
        if (props.settings.multipleNotificationMessage === "") {
            props.editSettings({
                multipleNotificationMessage: _("notification_multiple_message"),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div className="settings page" >
            <div className="popup-header">
                <div className="popup-header-title">
                    {_("settings_title")}
                </div>
                <div className="buttons">
                    <Button
                        onClick={() => props.onClose()}
                        label={_("button_goBack")}
                    />
                </div>
            </div>
            <div className="settings-body overflow-container">
                <div className="field">
                    <label className="label">{_("settings_language_label")}</label>
                    <div className="control">
                        <div className="select">
                            <select value={props.settings.language} onChange={(ev) => props.editSettings({ language: ev.target.value })}>
                                {
                                    availableLanguages.map((l) =>
                                        <option key={l.lang} value={l.lang}>{l.name}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div className="field">
                    <label className="label">{_("settings_fetchinterval_label")}</label>
                    <div className="control">
                        <div className="select">
                            <select value={props.settings.fetchInterval} onChange={(ev) => props.editSettings({
                                fetchInterval: parseInt(ev.target.value || "0", 10),
                            })} >
                                {
                                    [1, 2, 3, 5, 10, 20, 30].map(
                                        (n) => <option key={n * 60} value={n * 60}>
                                            {n === 1 ?
                                                _("settings_fetchinterval_option_singular")
                                                : _("settings_fetchinterval_option", [`${n}`])}
                                        </option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
                {!expandNotificationsSettings ?
                    <div className="field">
                        <label className="label">{_("settings_notifications_label")}</label>
                        <div className="control">
                            <Button
                                onClick={() => setExpandNotificationsSettings(true)}
                                label={_("settings_notifications_button")}
                            />
                        </div>
                    </div>
                    : <>
                        <TextField
                            label={_("settings_notifications_single_title")}
                            placeholder={_("settings_notifications_placeholder")}
                            value={props.settings.singleNotificationTitle}
                            onChange={(newValue) => props.editSettings({
                                singleNotificationTitle: newValue,
                            })}
                        />
                        <TextField
                            label={_("settings_notifications_single_message")}
                            placeholder={_("settings_notifications_placeholder")}
                            value={props.settings.singleNotificationMessage}
                            onChange={(newValue) => props.editSettings({
                                singleNotificationMessage: newValue,
                            })}
                        />
                        <TextField
                            label={_("settings_notifications_multiple_title")}
                            placeholder={_("settings_notifications_placeholder")}
                            value={props.settings.multipleNotificationTitle}
                            onChange={(newValue) => props.editSettings({
                                multipleNotificationTitle: newValue,
                            })}
                        />
                        <TextField
                            label={_("settings_notifications_multiple_message")}
                            placeholder={_("settings_notifications_placeholder")}
                            value={props.settings.multipleNotificationMessage}
                            onChange={(newValue) => props.editSettings({
                                multipleNotificationMessage: newValue,
                            })}
                        />
                    </>}
                <CheckboxField
                    id={"darkTheme"}
                    preLabel={_("settings_darkTheme_preLabel")}
                    label={_("settings_darkTheme_label")}
                    value={props.settings.darkTheme}
                    onChange={(newValue) => props.editSettings({
                        darkTheme: newValue,
                    })}
                />
                <CheckboxField
                    visible={!/firefox/i.test(navigator.userAgent)}
                    id={"icon"}
                    preLabel={_("settings_icon_preLabel")}
                    label={_("settings_icon_label")}
                    value={props.settings.useLightIcon}
                    onChange={(newValue) => props.editSettings({
                        useLightIcon: newValue,
                    })}
                />
                <div className="field" style={{
                    marginBottom: "0.75rem",
                }}>
                    <label className="label">{_("settings_domain_label")}</label>
                    <div className="control">
                        <div className="select">
                            <select defaultValue={props.settings.preferredDomain} onChange={(ev) => props.editSettings({
                                preferredDomain: ev.target.value,
                            })}>
                                {
                                    protonDomains.map((d) => <option key={d} value={d}>{d}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
