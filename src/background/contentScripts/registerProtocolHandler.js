(() => {
    try {
        navigator.registerProtocolHandler("mailto",
            `https://${document.domain}/api/mailtoHandler#token=${"%token%"},email=${"%email%"},mailto=%s`,
            `ProtonMail ${"%email%"}`);
        return "done";
    } catch (error) {
        return `error: ${error.message}`;
    }
})();
