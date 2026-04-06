// js/pages/createPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");

  const createBtn = document.getElementById("createBtn");
  const backToLoginBtn = document.getElementById("backToLoginBtn");

  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const existingUser = App.accountManager.findUserByUsername(username);

      if (existingUser) {
        alert("That username is already taken.");
        return;
      }

      try {
        await App.authService.signUp(username, password, "user");
        alert("Account created successfully.");
        window.location.href = "index.html";
      } catch (error) {
        console.error(error);
        alert("Failed to create account. Please try again.");
      }
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});