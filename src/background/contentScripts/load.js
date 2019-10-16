(() => {
    try {
        const obj = "%obj%";
        window.name = obj.windowName;
        const keys = Object.keys(obj.sessionStorage);
        for (const key of keys) {
            window.sessionStorage.setItem(key, obj.sessionStorage[key]);
        }
        return "done";
    } catch (error) {
        return `error: ${error.message}`;
    }
})();
