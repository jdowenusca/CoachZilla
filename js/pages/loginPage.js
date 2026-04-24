// Login page behavior and navigation handling.

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const createAccountBtn = document.getElementById("createAccountBtn");
  const aboutBtn = document.getElementById("aboutBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      try {
        const userProfile = await App.authService.signIn(username, password);
        App.currentUser = userProfile;

        if (userProfile.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "main.html";
        }
      } catch (error) {
        console.error(error);
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

  // Disclaimer modal close
  const closeDisclaimerBtn = document.getElementById("closeDisclaimer");
  if (closeDisclaimerBtn) {
    closeDisclaimerBtn.addEventListener("click", () => {
      const modal = document.getElementById("disclaimerModal");
      modal.classList.add("hidden");
    });
  }
});