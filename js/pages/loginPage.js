// js/pages/loginPage.js

import { App } from "../app/app.js";

window.onload = () => {
    App.init();

    const loginBtn = document.getElementById("loginBtn");

    loginBtn?.addEventListener("click", () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const user = App.accountManager.login(username, password);

        if (user) {
            App.currentUser = user;
            window.location.href = "main.html";
        } else {
            alert("Invalid login");
        }
    });
};