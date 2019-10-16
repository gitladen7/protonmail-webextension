(() => {
    try {
        window.dispatchEvent(new Event("unload"));
        const windowName = window.name;
        window.name = "";
        const wno = JSON.parse(windowName);
        const keys = Object.keys(wno);
        const sessionStorageObj = {};
        for (const key of keys) {
            sessionStorageObj[key] = window.sessionStorage.getItem(key);
        }
        const r = {
            windowName: windowName,
            sessionStorage: sessionStorageObj,
            email: document.querySelector(".navigationUser-head-email").innerText,
        };
        return r;
    } catch (err) {
        return {};
    }
})();
