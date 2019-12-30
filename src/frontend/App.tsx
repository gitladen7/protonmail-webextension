import React from "react";
import { openEmailFromPopup } from "./helpers/openEmailFromPopup";
import { AppState, RootAction, rootAction, RootActionProps } from "../shared/store";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import Settings from "./pages/Settings";
import AccountsList from "./pages/AccountsList";
import AccountSettings from "./pages/AccountSettings";
import AccountPeek from "./pages/AccountPeek";
import { useLanguage } from "./helpers/useLanguage";
import Loading from "./pages/Loading";

const mapStateToProps = (state: AppState) => ({
    ui: state.ui,
    accounts: state.accounts,
    settings: state.settings,
    peek: state.peek,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
    bindActionCreators({
        ...rootAction.accounts,
        ...rootAction.ui,
        ...rootAction.settings,
        ...rootAction.peek,
        ...rootAction.global,
    },
        dispatch as any
    );

const App: React.FC<AppState & RootActionProps> = (props) => {
    const loading = props.ui.loading && process.env.NODE_ENV !== "development";
    const loadingLanguage = useLanguage(loading, props.settings.language);

    if (loading) {
        return <Loading title="Loading..." />;
    }

    if (props.settings.darkTheme) {
        document.documentElement.classList.add("darkTheme");
    } else {
        document.documentElement.classList.remove("darkTheme");
    }

    if (loadingLanguage) {
        return <Loading title="Loading locale..." />;
    }

    if (props.ui.showingSettings) {
        return <Settings
            settings={props.settings}
            onClose={() => props.setUI({
                showingSettings: false,
            })}
            editSettings={props.setSettings}
        />;
    }

    const editingAccount = props.accounts.find((s) => s.email === props.ui.editingAccountEmail && props.ui.editingAccountEmail !== "");
    if (editingAccount !== undefined) {
        return <AccountSettings
            account={editingAccount}
            onClose={() => props.setUI({
                editingAccountEmail: "",
            })}
            deleteAccount={() => {
                props.setUI({
                    editingAccountEmail: "",
                }); props.deleteAccount(editingAccount.email);
            }}
            editAccount={(obj) => props.editAccount(editingAccount.email, obj)}
            onRegisterAsProtocolHandlerClick={() => openEmailFromPopup(editingAccount.email, "", true)}
        />;
    }

    const peekingAccount = props.accounts.find((s) => s.email === props.peek.email && props.peek.email !== "");
    if (peekingAccount !== undefined && peekingAccount.sessions.length > 0) {
        return <AccountPeek
            account={peekingAccount}
            onClose={() => props.clearPeek()}
            peek={props.peek}
            markAsRead={props.markPeekAsRead}
            onOpenClick={(email, path) => openEmailFromPopup(email, path)}
        />;
    }

    return (
        <AccountsList
            onOpenClick={(email) => openEmailFromPopup(email, "")}
            onSettingsClick={(email) => props.setUI({
                editingAccountEmail: email,
            })}
            setUI={(obj) => props.setUI(obj)}
            ui={props.ui}
            accounts={props.accounts}
            setPeek={props.setPeek}
        />
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

