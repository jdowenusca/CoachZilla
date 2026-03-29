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
  const busSelect = document.getElementById("busSelect");
  const buildBtn = document.getElementById("buildRouteBtn");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const buses = App.busManager.getAllBuses();
  const stations = App.stationManager.getAllStations();

  let selectedDestinationIds = [];

  if (busSelect) {
    buses.forEach((bus) => {
      const option = document.createElement("option");
      option.value = bus.id;
      option.textContent = `${bus.make} ${bus.model}`;
      busSelect.appendChild(option);
    });
  }

  renderStations(stations);

  if (buildBtn) {
    buildBtn.addEventListener("click", () => {
      try {
        const busId = busSelect.value;
        const selectedBus = buses.find((b) => b.id === busId);

        if (!selectedBus) {
          alert("Select a bus first.");
          return;
        }

        if (selectedDestinationIds.length < 2) {
          alert("Select at least 2 destinations.");
          return;
        }

        const newPlan = App.travelPlanManager.createTravelPlan(
          currentUser.userID,
          selectedBus,
          selectedDestinationIds,
          stations
        );

        localStorage.setItem("activeTravelPlanId", newPlan.travelPlanId);
        window.location.href = "travel.html";
      } catch (err) {
        console.error(err);
        alert("Failed to create route.");
      }
    });
  }

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
      const activeTravelPlanId = localStorage.getItem("activeTravelPlanId");

      if (!activeTravelPlanId) {
        alert("Build a travel plan first.");
        return;
      }

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
      localStorage.removeItem("activeTravelPlanId");
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  if (stationSearchInput) {
    stationSearchInput.addEventListener("input", () => {
      const searchText = stationSearchInput.value.trim().toLowerCase();

      const filteredStations = stations.filter((station) =>
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

    stationsSearchList.innerHTML = stationsToRender
      .map(
        (station) => `
      <div class="admin-card">
        <p><strong>Name:</strong> ${station.name || "N/A"}</p>
        <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
        <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
        <p><strong>Type:</strong> ${station.stationType || station.fuelType || "N/A"}</p>
        <button class="add-station-btn" data-station-id="${station.id}">Add to Travel Plan</button>
      </div>
    `
      )
      .join("");

    const addButtons = document.querySelectorAll(".add-station-btn");

    addButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        addStationToTravelPlan(stationId);
      });
    });
  }

  function addStationToTravelPlan(stationId) {
    const station = stations.find((s) => String(s.id) === String(stationId));

    if (!station) {
      alert("Station not found.");
      return;
    }

    const alreadyExists = selectedDestinationIds.includes(String(stationId));

    if (alreadyExists) {
      alert("That station is already in your travel plan.");
      return;
    }

    selectedDestinationIds.push(String(stationId));
    alert(`${station.name} added to travel plan.`);
  }
});