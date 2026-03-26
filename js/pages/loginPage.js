// js/pages/loginPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const createAccountBtn = document.getElementById("createAccountBtn");
  const aboutBtn = document.getElementById("aboutBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      const user = App.accountManager.validateLogin(username, password);

      if (user) {
        App.currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));

        if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "main.html";
        }
      } else {
        alert("Invalid username or password.");
      }
    });
  }

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      window.location.href = "create.html";
    });
  }

  if (aboutBtn) {
    aboutBtn.addEventListener("click", () => {
      window.location.href = "about.html";
    });
  }
});