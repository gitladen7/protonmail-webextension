import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { IBackgroundPage } from "../shared/types";
import { frontendStore } from "./frontendStore";
import "./scss/index.scss";
import "./scss/dark.scss";

if (typeof browser !== "undefined" &&
    (browser.extension.getBackgroundPage() as any as IBackgroundPage).backgroundPageInitialized !== true) {
    ReactDOM.render(
        <div style={{
            padding: "30px",
        }}>Loading... Please try again in some seconds.</div>, document.getElementById("root"));
} else {
    ReactDOM.render(
        <Provider store={frontendStore}>
            <App />
        </Provider>, document.getElementById("root"));
}
