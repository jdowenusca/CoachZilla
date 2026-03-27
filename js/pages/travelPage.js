// js/pages/travelPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!storedUser) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
    return;
  }

  App.currentUser = storedUser;

  const backHomeBtn = document.getElementById("backHomeBtn");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const clearTravelPlanBtn = document.getElementById("clearTravelPlanBtn");
  const travelPlanList = document.getElementById("travelPlanList");

  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      if (storedUser.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "main.html";
      }
    });
  }

  if (goSearchBtn) {
    goSearchBtn.addEventListener("click", () => {
      window.location.href = "search.html";
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

  if (clearTravelPlanBtn) {
    clearTravelPlanBtn.addEventListener("click", () => {
      localStorage.removeItem("selectedStations");
      renderTravelPlan();
      alert("Travel plan cleared.");
    });
  }

  renderTravelPlan();

  function renderTravelPlan() {
    if (!travelPlanList) return;

    const selectedStations =
      JSON.parse(localStorage.getItem("selectedStations")) || [];

    if (selectedStations.length === 0) {
      travelPlanList.innerHTML = "<p>No stations selected yet.</p>";
      return;
    }

    travelPlanList.innerHTML = selectedStations.map((station, index) => `
      <div class="admin-card">
        <p><strong>Name:</strong> ${station.name || "N/A"}</p>
        <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
        <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
        <p><strong>Type:</strong> ${station.stationType || station.fuelType || "N/A"}</p>
        <button class="remove-station-btn" data-index="${index}">Remove</button>
      </div>
    `).join("");

    const removeButtons = document.querySelectorAll(".remove-station-btn");

    removeButtons.forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        removeStationAtIndex(index);
      });
    });
  }

  function removeStationAtIndex(index) {
    const selectedStations =
      JSON.parse(localStorage.getItem("selectedStations")) || [];

    if (index < 0 || index >= selectedStations.length) {
      return;
    }

    const removedStation = selectedStations[index];
    selectedStations.splice(index, 1);

    localStorage.setItem("selectedStations", JSON.stringify(selectedStations));
    renderTravelPlan();

    if (removedStation?.name) {
      alert(`${removedStation.name} removed from travel plan.`);
    }
  }
});