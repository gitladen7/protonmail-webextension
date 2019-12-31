(async () => {
    try {
        const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const refresh = document.querySelector(".refresh");
        if (refresh !== null) {
            refresh.click();
        }
        await wait(100);

        window.history.pushState({}, "", `${"%url%"}`);
        window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
        return "done";
    } catch (error) {
        return `error: ${error.message}`;
    }
})();
