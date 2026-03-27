// js/pages/searchPage.js

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
  const goTravelBtn = document.getElementById("goTravelBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const stationSearchInput = document.getElementById("stationSearchInput");
  const stationsSearchList = document.getElementById("stationsSearchList");

  let stations = App.stationManager.getAllStations();

  renderStations(stations);

  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      if (storedUser.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "main.html";
      }
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
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  if (stationSearchInput) {
    stationSearchInput.addEventListener("input", () => {
      const searchText = stationSearchInput.value.trim().toLowerCase();

      const filteredStations = stations.filter(station =>
        (station.name || "").toLowerCase().includes(searchText)
      );

      renderStations(filteredStations);
    });
  }

  function renderStations(stationsToRender) {
    if (!stationsSearchList) return;

    if (!stationsToRender || stationsToRender.length === 0) {
      stationsSearchList.innerHTML = "<p>No matching stations found.</p>";
      return;
    }

    stationsSearchList.innerHTML = stationsToRender.map((station, index) => `
      <div class="admin-card">
        <p><strong>Name:</strong> ${station.name || "N/A"}</p>
        <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
        <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
        <p><strong>Type:</strong> ${station.stationType || station.fuelType || "N/A"}</p>
        <button class="add-station-btn" data-index="${index}">Add to Travel Plan</button>
      </div>
    `).join("");

    const addButtons = document.querySelectorAll(".add-station-btn");

    addButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const station = stationsToRender[index];
        addStationToTravelPlan(station);
      });
    });
  }

  function addStationToTravelPlan(station) {
    const existingPlan = JSON.parse(localStorage.getItem("selectedStations")) || [];

    const alreadyExists = existingPlan.some(savedStation =>
      savedStation.id === station.id
    );

    if (alreadyExists) {
      alert("That station is already in your travel plan.");
      return;
    }

    existingPlan.push(station);
    localStorage.setItem("selectedStations", JSON.stringify(existingPlan));

    alert(`${station.name} added to travel plan.`);
  }
});