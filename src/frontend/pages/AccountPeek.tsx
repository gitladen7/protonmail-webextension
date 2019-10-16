import React from "react";
import { IProtonAccount } from "../../shared/store/accounts/types";
import { IPeekState, IPeekMessage } from "../../shared/store/peek/types";
import { peekFromPopup } from "../helpers/peekFromPopup";
import { ago } from "../helpers/ago";
import { markAsReadFromPopup } from "../helpers/markAsReadFromPopup";
import Button from "../components/button";
import { _ } from "../../shared/i18n";

interface AccountPeekProps {
    account: IProtonAccount;
    onClose: () => void;
    peek: IPeekState;
    markAsRead: (id: number[]) => void;
    onOpenClick: (email: string, path: string) => void;
}

interface AccountPeekRowProps {
    message: IPeekMessage;
    onOpenClick: () => void;
    markAsRead: () => void;
}

const AccountPeekRow: React.FC<AccountPeekRowProps> = (props) => {
    const message = props.message;
    return (<li>
        <div className="media">
            <div className="media-content" >
                <div className="peek-subject" >
                    {message.subject}
                </div>
                <div>
                    <span className="peek-from is-size-7" >
                        {_("peeking_receivedFrom")}
                        <span> </span>
                        <span className="tooltip" data-tooltip={message.from}>{message.fromName || message.from}</span>
                        <span> </span>
                        <time className="tooltip" data-tooltip={new Date(message.date).toLocaleString()}>
                            {ago(new Date(message.date))}
                        </time>
                    </span>
                </div>
            </div>
            <div className="media-right buttons">
                <Button
                    onClick={props.markAsRead}
                    tooltip={_("peeking_markAsRead")}
                    tooltipPosition="left"
                    icon="eye"
                />
                <Button
                    onClick={props.onOpenClick}
                    tooltip={_("peeking_open")}
                    tooltipPosition="left"
                    icon="link"
                />
            </div>
        </div>
    </li>);
};

const AccountPeekRowMemo = React.memo(AccountPeekRow);

const AccountPeek: React.FC<AccountPeekProps> = (props) => {
    const unreadMessages = props.peek.messages
        .filter((r) => !r.read);
    const more = (props.peek.total - props.peek.messages.length) > 0;
    return (
        <div className="peek-list page">
            <div className="popup-header">
                <div className="popup-header-title">
                    {props.peek.email}
                </div>
                <div className="buttons">
                    <Button
                        disabled={props.peek.loading}
                        onClick={() => peekFromPopup(props.peek.email)}
                        tooltip={_("peeking_refresh")}
                        tooltipPosition="bottom"
                        icon={props.peek.loading ? "hourglass" : "sync"}
                    />
                    <Button
                        disabled={props.peek.messages.length === 0}
                        onClick={() => {
                            markAsReadFromPopup(props.peek.email, props.peek.messages.map((m) => m.protonId));
                            props.markAsRead(props.peek.messages.map((m) => m.id));
                        }}
                        tooltip={_("peeking_markAllAsRead")}
                        tooltipPosition="bottom"
                        icon="eye"
                    />
                    <Button
                        visible={props.account.persist}
                        onClick={() => props.onOpenClick(props.account.email, "")}
                        tooltip={props.account.sessions.length === 0 ? _("tooltip_autofill") : _("tooltip_open")}
                        tooltipPosition="bottom"
                        icon="link"
                    />
                    <Button
                        onClick={() => props.onClose()}
                        label={_("button_goBack")}
                    />
                </div>
            </div>
            {
                props.peek.loading && unreadMessages.length === 0 && !more &&
                <div className="peek-list-body">
                    <div className="field">
                        <span>{_("peeking_loading")}</span>
                    </div>
                </div>
            }
            {
                !props.peek.loading && props.peek.error !== "" &&
                <div className="peek-list-body">
                    <div className="field">
                        <span>{_("peeking_error")} {props.peek.error}</span>
                    </div>
                </div>
            }
            {
                !props.peek.loading && props.peek.error === "" && unreadMessages.length === 0 && !more &&
                <div className="peek-list-body">
                    <div className="field">
                        <span>{_("peeking_noMessages")}</span>
                    </div>
                </div>
            }

            {props.peek.error === "" &&
                <div className="overflow-container">
                    <ul className="peek-list-list">
                        {
                            unreadMessages
                                .map((message) =>
                                    <AccountPeekRowMemo
                                        key={message.id}
                                        message={message}
                                        markAsRead={() => {
                                            markAsReadFromPopup(props.peek.email, [message.protonId]);
                                            props.markAsRead([message.id]);
                                        }}
                                        onOpenClick={() =>
                                            props.onOpenClick(props.peek.email,
                                                `/inbox/${props.account.viewMode === 0 ? message.protonConvId : message.protonId}`
                                            )}
                                    />)
                        }
                    </ul>
                </div>}

            {props.peek.error === "" && more &&
                <div className="popup-footer colored more">
                    <Button
                        onClick={() => props.onOpenClick(props.account.email, "")}
                        tooltip={props.account.sessions.length === 0 ? _("tooltip_autofill") : _("tooltip_open")}
                        icon="link"
                        label={_("peeking_moreMessages_button", [`${props.peek.total - props.peek.messages.length}`])}
                    />
                </div>}

        </div >
    );
};

export default AccountPeek;
