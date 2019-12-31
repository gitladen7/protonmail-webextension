(async () => {
    try {
        const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const refresh = document.querySelector("a.navigationItem-item[href$='/inbox']") ||
            document.querySelector("a.navigation__link[href$='/inbox']");
        if (refresh !== null) {
            refresh.click();
            await wait(100);
            refresh.click();
            await wait(100);
        }

        window.history.pushState({}, "", `${"%url%"}`);
        window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
        return "done";
    } catch (error) {
        return `error: ${error.message}`;
    }
})();
