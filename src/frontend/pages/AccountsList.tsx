import React from "react";
import { IProtonAccount } from "../../shared/store/accounts/types";
import { IUIState } from "../../shared/store/ui/types";
import { openProtonmailFromPopup } from "../helpers/openProtonmailFromPopup";
import { syncFromPopup } from "../helpers/syncFromPopup";
import { peekFromPopup } from "../helpers/peekFromPopup";
import Button from "../components/button";
import { _ } from "../../shared/i18n";

interface AccountsListRowProps {
    account: IProtonAccount;
    onOpenClick: (email: string) => void;
    onSettingsClick: (email: string) => void;
    setPeek: (a: any) => void;
}

const AccountsListRow: React.FC<AccountsListRowProps> = (props) => {
    const account = props.account;
    return <li>
        <div className="email-info " >
            {typeof account.unreadCount === "number" &&
                account.sessions.length !== 0 && account.showUnreadCountBadge && account.unreadCount !== 0 &&
                <span className="tag is-danger is-rounded">
                    {account.unreadCount}
                </span>}
            <span>{account.email}</span>
        </div>
        <div className="buttons">
            <Button
                visible={account.sessions.length !== 0 && account.peeking}
                onClick={() => process.env.NODE_ENV === "development" ?
                    props.setPeek({
                        email: account.email,
                    }) : peekFromPopup(account.email, true)}
                icon="eye"
                tooltip={_("tooltip_peek")}
                tooltipPosition={"left"}
            />
            <Button
                visible={account.persist}
                onClick={() => props.onOpenClick(account.email)}
                icon="link"
                tooltip={account.sessions.length === 0 ? _("tooltip_autofill") : _("tooltip_open")}
                tooltipPosition={"left"}
            />
            <Button
                color={"none"}
                onClick={() => props.onSettingsClick(account.email)}
                icon="cog"
                badge={account.sessionExpired ? _("badge_expired") : undefined}
            />
        </div>
    </li>;
};

const AccountsListRowMemo = React.memo(AccountsListRow);

interface AccountsListProps {
    setUI: (obj: Partial<IUIState>) => void;
    ui: IUIState;
    accounts: IProtonAccount[];
    onOpenClick: (email: string) => void;
    onSettingsClick: (email: string) => void;
    setPeek: (a: any) => void;
}

const AccountsList: React.FC<AccountsListProps> = (props) => {
    const accountsToDisplay = props.accounts
        .filter((s) => s.hidden === false || s.sessionExpired === true || props.ui.displayHidden);
    return (
        <div className="accounts-list page">
            <div className="popup-header">
                <div className="popup-header-title">
                    {_("accounts_title")}
                </div>
                <div className="buttons">
                    <Button
                        visible={accountsToDisplay.length !== 0}
                        disabled={props.ui.syncing}
                        onClick={() => syncFromPopup()}
                        icon={props.ui.syncing ? "hourglass" : "sync"}
                    />
                    <Button
                        onClick={() => props.setUI({
                            showingSettings: true,
                        })}
                        icon="cog"
                    />
                </div>
            </div>
            {
                props.ui.showIncognitoModeWarning && !props.ui.dissmissedIncognitoModeWarning &&
                <article className="message is-warning">
                    <div className="message-body">
                        <button className="delete" onClick={() => props.setUI({
                            dissmissedIncognitoModeWarning: true,
                        })}></button>
                        {_("warning_incognito")}
                    </div>
                </article>
            }
            {
                props.ui.showContainersWarning && !props.ui.dissmissedContainersWarning &&
                <article className="message is-warning">
                    <div className="message-body">
                        <button className="delete" onClick={() => props.setUI({
                            dissmissedContainersWarning: true,
                        })}></button>
                        {_("warning_container")}
                    </div>
                </article>
            }
            {
                accountsToDisplay.length === 0 &&
                <div className="accounts-list-body">
                    <div className="field">
                        <span>{_("accounts_noAccounts")}</span>
                    </div>
                </div>
            }
            {accountsToDisplay.length !== 0 &&
                <div className="overflow-container">
                    <ul className="accounts-list-list">
                        {
                            accountsToDisplay
                                .map((account) =>
                                    <AccountsListRowMemo
                                        key={account.email}
                                        account={account}
                                        onOpenClick={props.onOpenClick}
                                        onSettingsClick={props.onSettingsClick}
                                        setPeek={props.setPeek}
                                    />)
                        }
                    </ul>
                </div>}
            {(accountsToDisplay.length === 0 || props.accounts.findIndex((s) => s.hidden) !== -1) &&
                <div className="popup-footer colored">
                    <Button
                        visible={accountsToDisplay.length === 0}
                        label={_("button_pmOpen")}
                        icon={"link"}
                        onClick={() => openProtonmailFromPopup()}
                    />
                    <div className="popup-footer-right noselect">
                        {props.accounts.length !== 0 && <>
                            <input id={"hide"} type="checkbox" className="switch is-rounded"
                                checked={props.ui.displayHidden} onChange={(ev) => props.setUI({
                                    displayHidden: ev.target.checked,
                                })} />
                            <label htmlFor={"hide"}>{_("accounts_hidden_checkbox")}</label>
                        </>}
                    </div>
                </div>}
        </div >
    );
};

export default AccountsList;
