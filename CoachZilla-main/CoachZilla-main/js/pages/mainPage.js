// js/pages/mainPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const welcomeMessage = document.getElementById("welcomeMessage");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goTravelBtn = document.getElementById("goTravelBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());

  if (!storedUser) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
    return;
  }

  App.currentUser = storedUser;

  if (welcomeMessage) {
    const displayName =
      storedUser.username || "User";
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
  }

  if (goSearchBtn) {
    goSearchBtn.addEventListener("click", () => {
      window.location.href = "search.html";
    });
  }

  if (goTravelBtn) {
    goTravelBtn.addEventListener("click", () => {
      window.location.href = "travel.html";
    });
  }

  if (goAboutBtn) {
    goAboutBtn.addEventListener("click", () => {
      window.location.href = "about.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await App.authService.signOut();
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }
});