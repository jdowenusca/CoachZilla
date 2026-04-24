// Account creation page behavior and validation.

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");
  const firstNameInput = document.getElementById("newFirstName");
  const lastNameInput = document.getElementById("newLastName");

  const createBtn = document.getElementById("createBtn");
  const backToLoginBtn = document.getElementById("backToLoginBtn");

  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();

      // Validate fields
      const nameRegex = /^[a-zA-Z\s\-']+$/;
      const maxLength = 15;

      if (!username || !password || !firstName || !lastName) {
        alert("Please fill in all fields.");
        return;
      }

      if (username.length > maxLength || firstName.length > maxLength || lastName.length > maxLength) {
        alert(`Username, first name, and last name must be ${maxLength} characters or less.`);
        return;
      }

      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        alert("Names can only contain letters, spaces, hyphens, and apostrophes.");
        return;
      }

      const existingUser = App.accountManager.findUserByUsername(username);

      if (existingUser) {
        alert("That username is already taken.");
        return;
      }

      try {
        await App.authService.signUp(username, password, "user", firstName, lastName);
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