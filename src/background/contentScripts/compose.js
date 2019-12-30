(async () => {
    try {
        const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const composeData = ("%obj%");
        const to = (typeof composeData.to === "string" ? composeData.to : "");
        const cc = (typeof composeData.cc === "string" ? composeData.cc : "");
        const bcc = (typeof composeData.bcc === "string" ? composeData.bcc : "");
        const subject = typeof composeData.subject === "string" ? composeData.subject : "";

        let composeButton = null;
        while (composeButton === null) {
            composeButton = document.querySelector("#pm_sidebar button");
            await wait(100);
        }

        const composerIds = [];
        document.querySelectorAll(".composer").forEach((composer) => composerIds.push(composer.id));
        composeButton.click();

        let newComposer = null;
        while (newComposer === null) {
            // eslint-disable-next-line no-loop-func
            document.querySelectorAll(".composer").forEach((composer) => {
                if (composerIds.indexOf(composer.id) === -1) {
                    newComposer = composer;
                }
            });
            if (newComposer === null) {
                await wait(100);
            }
        }

        const toInput = newComposer.querySelectorAll("input.autocompleteEmails-input")[0] || null;

        const bbcMoreButton = newComposer.querySelector(".composerInputMeta-trigger-button") ||
            newComposer.querySelector(".composerInputMeta-overlay-button");
        const subjectInput = newComposer.querySelector("input.subject") || newComposer.querySelector("input.composerSubject-input");

        if (toInput !== null) {
            for (const email of to.split(",")) {
                toInput.value = email;
                toInput.dispatchEvent(new Event("blur"));
            }
        }

        if (bbcMoreButton !== null && (cc !== "" || bcc !== "")) {
            bbcMoreButton.click();
            await wait(200);
        }

        const ccInput = newComposer.querySelectorAll("input.autocompleteEmails-input")[1] || null;
        const bccInput = newComposer.querySelectorAll("input.autocompleteEmails-input")[2] || null;

        if (ccInput !== null) {
            for (const email of cc.split(",")) {
                ccInput.value = email;
                ccInput.dispatchEvent(new Event("blur"));
            }
        }

        if (bccInput !== null) {
            for (const email of bcc.split(",")) {
                bccInput.value = email;
                bccInput.dispatchEvent(new Event("blur"));
            }
        }

        if (subjectInput !== null) {
            subjectInput.value = subject;
        }

        return "done";
    } catch (error) {
        return `error: ${error.message}`;
    }
})();
