// js/pages/createPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");

  const createBtn = document.getElementById("createBtn");
  const backToLoginBtn = document.getElementById("backToLoginBtn");

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const existingUser = App.accountManager
        .getAllUsers()
        .find(user => user.username === username);

      if (existingUser) {
        alert("That username is already taken.");
        return;
      }

      App.accountManager.addUser(username, password, "user");

      alert("Account created successfully.");
      window.location.href = "index.html";
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});