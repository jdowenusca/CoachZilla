// js/pages/aboutPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const backBtn = document.getElementById("backBtn");
  const homeBtn = document.getElementById("homeBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());

  if (storedUser) {
    App.currentUser = storedUser;
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      if (storedUser && storedUser.role === "admin") {
        window.location.href = "admin.html";
      } else if (storedUser) {
        window.location.href = "main.html";
      } else {
        window.location.href = "index.html";
      }
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