// js/pages/adminPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

  const adminWelcomeMessage = document.getElementById("adminWelcomeMessage");
  const adminUsersList = document.getElementById("adminUsersList");
  const adminBusesList = document.getElementById("adminBusesList");
  const adminStationsList = document.getElementById("adminStationsList");

  const goEditBtn = document.getElementById("goEditBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!storedUser) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
    return;
  }

  if (storedUser.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "main.html";
    return;
  }

  App.currentUser = storedUser;

  if (adminWelcomeMessage) {
    const displayName = storedUser.username || "Admin";
    adminWelcomeMessage.textContent = `Welcome, ${displayName}!`;
  }

  renderUsers();
  renderBuses();
  renderStations();

  if (goEditBtn) {
    goEditBtn.addEventListener("click", () => {
      window.location.href = "edit.html";
    });
  }

  if (goAboutBtn) {
    goAboutBtn.addEventListener("click", () => {
      window.location.href = "about.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  function renderUsers() {
    if (!adminUsersList) return;

    const users = App.accountManager.getAllUsers();

    if (!users || users.length === 0) {
      adminUsersList.innerHTML = "<p>No users found.</p>";
      return;
    }

    adminUsersList.innerHTML = users.map(user => `
      <div class="admin-card">
        <p><strong>Username:</strong> ${user.username || "N/A"}</p>
        <p><strong>Role:</strong> ${user.role || "user"}</p>
      </div>
    `).join("");
  }

  function renderBuses() {
    if (!adminBusesList) return;

    const buses = App.busManager.getAllBuses();

    if (!buses || buses.length === 0) {
      adminBusesList.innerHTML = "<p>No buses found.</p>";
      return;
    }

    adminBusesList.innerHTML = buses.map(bus => `
      <div class="admin-card">
        <p><strong>Make:</strong> ${bus.make || "N/A"}</p>
        <p><strong>Model:</strong> ${bus.model || "N/A"}</p>
        <p><strong>Type:</strong> ${bus.type || "N/A"}</p>
        <p><strong>Fuel Type:</strong> ${bus.fuelType || "N/A"}</p>
        <p><strong>Tank Size:</strong> ${bus.fuelTankSize ?? "N/A"}</p>
        <p><strong>Burn Rate:</strong> ${bus.fuelBurnRate ?? "N/A"}</p>
        <p><strong>Cruise Speed:</strong> ${bus.cruiseSpeed ?? "N/A"}</p>
      </div>
    `).join("");
  }

  function renderStations() {
    if (!adminStationsList) return;

    const stations = App.stationManager.getAllStations();

    if (!stations || stations.length === 0) {
      adminStationsList.innerHTML = "<p>No stations found.</p>";
      return;
    }

    adminStationsList.innerHTML = stations.map(station => `
      <div class="admin-card">
        <p><strong>ID:</strong> ${station.id || "N/A"}</p>
        <p><strong>Name:</strong> ${station.name || "N/A"}</p>
        <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
        <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
        <p><strong>Type:</strong> ${station.stationType || station.fuelType || "N/A"}</p>
      </div>
    `).join("");
  }
});