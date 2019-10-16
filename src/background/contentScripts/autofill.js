let i = 100;
const f = () => {
    try {
        document.getElementById("username").value = "%email%";
        document.getElementById("username").disabled = true;
        document.getElementById("password").focus();
        setTimeout(() => { document.getElementById("username").disabled = false; }, 1000);
    } catch (err) {
        if (i-- > 0) {
            setTimeout(f, 100);
        }
    }
};
f();
