import { App } from "../app/app.js";
import LeafletMapService from "../services/LeafletMapService.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());

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

  const stationSearchInput = document.getElementById("stationFilter");
  const stationsSearchList = document.getElementById("stationList");
  const selectedRouteList = document.getElementById("selectedStops");
  const busSelect = document.getElementById("busSelect");
  const buildBtn = document.getElementById("buildRouteBtn");
  const clearRouteBtn = document.getElementById("clearRouteBtn");

  const currentUser = App.currentUser;
  const buses = App.busManager.getAllBuses();
  const allStations = App.stationManager.getAllStations();

  const mapService = new LeafletMapService();

  let filteredStations = [...allStations];
  let selectedDestinationIds = [];
  let activeTravelPlanId = null;
  let isCreatingPlan = false;

  try {
    mapService.initializeMap("map");
  } catch (error) {
    console.error("Leaflet map failed to initialize:", error);
  }

  populateBusSelect();
  renderStations(filteredStations);
  renderSelectedRoute();
  refreshMap();

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
      if (!activeTravelPlanId) {
        alert("Build a travel plan first.");
        return;
      }

      window.location.href = `travel.html?planId=${encodeURIComponent(activeTravelPlanId)}`;
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

  if (buildBtn) {
    buildBtn.addEventListener("click", async () => {
      if (isCreatingPlan) {
        return;
      }

      const busId = busSelect.value;
      const selectedBus = buses.find((b) => String(b.id) === String(busId));

      if (!selectedBus) {
        alert("Select a bus first.");
        return;
      }

      if (selectedDestinationIds.length < 2) {
        alert("Select at least 2 stations for the route.");
        return;
      }

      isCreatingPlan = true;
      buildBtn.disabled = true;
      const originalText = buildBtn.textContent;
      buildBtn.textContent = "Building Route...";

      try {
        const newPlan = await App.travelPlanManager.createTravelPlan(
          currentUser.userID,
          selectedBus,
          selectedDestinationIds,
          allStations
        );

        activeTravelPlanId = newPlan.travelPlanId;
        window.location.href = `travel.html?planId=${encodeURIComponent(activeTravelPlanId)}`;
      } catch (err) {
        console.error(err);
        alert(`Failed to create route: ${err.message}`);
        isCreatingPlan = false;
        buildBtn.disabled = false;
        buildBtn.textContent = originalText;
      }
    });
  }

  if (clearRouteBtn) {
    clearRouteBtn.addEventListener("click", () => {
      selectedDestinationIds = [];
      renderSelectedRoute();
      renderStations(filteredStations);
      refreshMap();
    });
  }

  if (stationSearchInput) {
    stationSearchInput.addEventListener("input", () => {
      const searchText = stationSearchInput.value.trim().toLowerCase();

      filteredStations = allStations.filter((station) => {
        const name = String(station.name || "").toLowerCase();
        const type = String(station.stationType || station.fuelType || "").toLowerCase();

        return name.includes(searchText) || type.includes(searchText);
      });

      renderStations(filteredStations);
      refreshMap();
    });
  }

  function populateBusSelect() {
    if (!busSelect) return;

    busSelect.innerHTML = `<option value="">-- Select a Bus --</option>`;

    buses.forEach((bus) => {
      const option = document.createElement("option");
      option.value = bus.id;
      option.textContent = `${bus.make} ${bus.model} (${bus.fuelType})`;
      busSelect.appendChild(option);
    });
  }

  function renderStations(stationsToRender) {
    if (!stationsSearchList) return;

    if (!stationsToRender || stationsToRender.length === 0) {
      stationsSearchList.innerHTML = "<p>No matching stations found.</p>";
      return;
    }

    stationsSearchList.innerHTML = stationsToRender
      .map((station) => {
        const isSelected = selectedDestinationIds.includes(String(station.id));
        const typeLabel = station.stationType || station.fuelType || "Station";

        return `
          <div class="admin-card">
            <p><strong>Name:</strong> ${station.name || "N/A"}</p>
            <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
            <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
            <p><strong>Type:</strong> ${typeLabel}</p>
            <div class="station-card-actions">
              <button
                class="add-station-btn"
                data-station-id="${station.id}"
                type="button"
                ${isSelected ? "disabled" : ""}
              >
                ${isSelected ? "Added" : "Add to Route"}
              </button>
              <button
                class="focus-station-btn"
                data-station-id="${station.id}"
                type="button"
              >
                Focus on Map
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    const addButtons = document.querySelectorAll(".add-station-btn");
    const focusButtons = document.querySelectorAll(".focus-station-btn");

    addButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        addStationToTravelPlan(stationId);
      });
    });

    focusButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        const station = allStations.find((s) => String(s.id) === String(stationId));

        if (station) {
          mapService.focusStation(station);
        }
      });
    });
  }

  function renderSelectedRoute() {
    if (!selectedRouteList) return;

    if (selectedDestinationIds.length === 0) {
      selectedRouteList.innerHTML = "<p>No stations selected yet.</p>";
      return;
    }

    const selectedStations = selectedDestinationIds
      .map((stationId) => allStations.find((station) => String(station.id) === String(stationId)))
      .filter(Boolean);

    selectedRouteList.innerHTML = selectedStations
      .map((station, index) => {
        let roleLabel = "Stop";

        if (index === 0) roleLabel = "Start";
        if (index === selectedStations.length - 1 && selectedStations.length > 1) roleLabel = "End";
        if (index > 0 && index < selectedStations.length - 1) roleLabel = `Stop ${index}`;

        return `
          <div class="admin-card">
            <p><strong>${roleLabel}:</strong> ${station.name}</p>
            <p><strong>Type:</strong> ${station.stationType || station.fuelType || "Station"}</p>
            <button
              class="remove-selected-station-btn"
              data-station-id="${station.id}"
              type="button"
            >
              Remove
            </button>
          </div>
        `;
      })
      .join("");

    const removeButtons = document.querySelectorAll(".remove-selected-station-btn");

    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        removeStationFromTravelPlan(stationId);
      });
    });
  }

  function addStationToTravelPlan(stationId) {
    const station = allStations.find((s) => String(s.id) === String(stationId));

    if (!station) {
      alert("Station not found.");
      return;
    }

    const alreadyExists = selectedDestinationIds.includes(String(stationId));

    if (alreadyExists) {
      alert("That station is already in your route.");
      return;
    }

    selectedDestinationIds.push(String(stationId));
    renderSelectedRoute();
    renderStations(filteredStations);
    refreshMap();
  }

  function removeStationFromTravelPlan(stationId) {
    selectedDestinationIds = selectedDestinationIds.filter(
      (id) => String(id) !== String(stationId)
    );

    renderSelectedRoute();
    renderStations(filteredStations);
    refreshMap();
  }

  function refreshMap() {
    try {
      mapService.renderStations(filteredStations, addStationToTravelPlan, selectedDestinationIds);

      const selectedStations = selectedDestinationIds
        .map((stationId) => allStations.find((station) => String(station.id) === String(stationId)))
        .filter(Boolean);

      mapService.drawPreviewRoute(selectedStations);
    } catch (error) {
      console.error("Failed to refresh map:", error);
    }
  }
});