import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

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

  const backToAdminBtn = document.getElementById("backToAdminBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const busFormTitle = document.getElementById("busFormTitle");
  const editingBusId = document.getElementById("editingBusId");
  const busMake = document.getElementById("busMake");
  const busModel = document.getElementById("busModel");
  const busType = document.getElementById("busType");
  const busFuelType = document.getElementById("busFuelType");
  const busFuelTankSize = document.getElementById("busFuelTankSize");
  const busFuelBurnRate = document.getElementById("busFuelBurnRate");
  const busCruiseSpeed = document.getElementById("busCruiseSpeed");
  const saveBusBtn = document.getElementById("saveBusBtn");
  const cancelBusEditBtn = document.getElementById("cancelBusEditBtn");

  const stationFormTitle = document.getElementById("stationFormTitle");
  const editingStationId = document.getElementById("editingStationId");
  const stationMode = document.getElementById("stationMode");
  const stationName = document.getElementById("stationName");
  const stationLatitude = document.getElementById("stationLatitude");
  const stationLongitude = document.getElementById("stationLongitude");
  const stationExtraField = document.getElementById("stationExtraField");
  const saveStationBtn = document.getElementById("saveStationBtn");
  const cancelStationEditBtn = document.getElementById("cancelStationEditBtn");

  const editBusesList = document.getElementById("editBusesList");
  const editStationsList = document.getElementById("editStationsList");

  setupNavigation();
  setupForms();
  renderBuses();
  renderStations();
  resetBusForm();
  resetStationForm();

  function setupNavigation() {
    if (backToAdminBtn) {
      backToAdminBtn.addEventListener("click", () => {
        window.location.href = "admin.html";
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
  }

  function setupForms() {
    if (stationMode) {
      stationMode.addEventListener("change", updateStationExtraFieldLabel);
    }

    if (saveBusBtn) {
      saveBusBtn.addEventListener("click", handleSaveBus);
    }

    if (cancelBusEditBtn) {
      cancelBusEditBtn.addEventListener("click", resetBusForm);
    }

    if (saveStationBtn) {
      saveStationBtn.addEventListener("click", handleSaveStation);
    }

    if (cancelStationEditBtn) {
      cancelStationEditBtn.addEventListener("click", resetStationForm);
    }

    updateStationExtraFieldLabel();
  }

  function handleSaveBus() {
    const make = busMake.value.trim();
    const model = busModel.value.trim();
    const type = busType.value.trim();
    const fuelType = busFuelType.value.trim();
    const fuelTankSize = Number(busFuelTankSize.value);
    const fuelBurnRate = Number(busFuelBurnRate.value);
    const cruiseSpeed = Number(busCruiseSpeed.value);

    if (
      !make ||
      !model ||
      !type ||
      !fuelType ||
      Number.isNaN(fuelTankSize) ||
      Number.isNaN(fuelBurnRate) ||
      Number.isNaN(cruiseSpeed)
    ) {
      alert("Please fill in all bus fields correctly.");
      return;
    }

    if (fuelTankSize <= 0 || fuelBurnRate <= 0 || cruiseSpeed <= 0) {
      alert("Fuel tank size, fuel burn rate, and cruise speed must be greater than 0.");
      return;
    }

    const existingBusId = editingBusId.value.trim();

    if (existingBusId) {
      const updatedBus = App.busManager.updateBus(existingBusId, {
        make,
        model,
        type,
        fuelType,
        fuelTankSize,
        fuelBurnRate,
        cruiseSpeed
      });

      if (!updatedBus) {
        alert("Failed to update bus.");
        return;
      }

      alert("Bus updated successfully.");
    } else {
      App.busManager.addBus(
        make,
        model,
        type,
        fuelType,
        fuelTankSize,
        fuelBurnRate,
        cruiseSpeed
      );

      alert("Bus added successfully.");
    }

    resetBusForm();
    renderBuses();
  }

  function handleSaveStation() {
    const mode = stationMode.value;
    const name = stationName.value.trim();
    const latitude = Number(stationLatitude.value);
    const longitude = Number(stationLongitude.value);
    const extraValue = stationExtraField.value.trim();

    if (
      !name ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      !extraValue
    ) {
      alert("Please fill in all station fields correctly.");
      return;
    }

    if (latitude < -90 || latitude > 90) {
      alert("Latitude must be between -90 and 90.");
      return;
    }

    if (longitude < -180 || longitude > 180) {
      alert("Longitude must be between -180 and 180.");
      return;
    }

    const existingStationId = editingStationId.value.trim();

    if (existingStationId) {
      let updatedStation = null;

      if (mode === "bus") {
        updatedStation = App.stationManager.updateBusStation(existingStationId, {
          name,
          latitude,
          longitude,
          stationType: extraValue
        });
      } else {
        updatedStation = App.stationManager.updateRefuelStation(existingStationId, {
          name,
          latitude,
          longitude,
          fuelType: extraValue
        });
      }

      if (!updatedStation) {
        alert("Failed to update station. Make sure the station type matches the selected mode.");
        return;
      }

      alert("Station updated successfully.");
    } else {
      if (mode === "bus") {
        App.stationManager.addBusStation(name, latitude, longitude, extraValue);
      } else {
        App.stationManager.addRefuelStation(name, latitude, longitude, extraValue);
      }

      alert("Station added successfully.");
    }

    resetStationForm();
    renderStations();
  }

  function renderBuses() {
    if (!editBusesList) return;

    const buses = App.busManager.getAllBuses();

    if (!buses || buses.length === 0) {
      editBusesList.innerHTML = "<p>No buses available.</p>";
      return;
    }

    editBusesList.innerHTML = buses.map((bus) => `
      <div class="admin-card">
        <p><strong>ID:</strong> ${bus.id ?? "N/A"}</p>
        <p><strong>Make:</strong> ${bus.make || "N/A"}</p>
        <p><strong>Model:</strong> ${bus.model || "N/A"}</p>
        <p><strong>Type:</strong> ${bus.type || "N/A"}</p>
        <p><strong>Fuel Type:</strong> ${bus.fuelType || "N/A"}</p>
        <p><strong>Tank Size:</strong> ${bus.fuelTankSize ?? "N/A"}</p>
        <p><strong>Burn Rate:</strong> ${bus.fuelBurnRate ?? "N/A"}</p>
        <p><strong>Cruise Speed:</strong> ${bus.cruiseSpeed ?? "N/A"}</p>
        <div class="card-action-row">
          <button class="edit-bus-btn" data-bus-id="${bus.id}" type="button">Edit</button>
          <button class="delete-bus-btn" data-bus-id="${bus.id}" type="button">Delete</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".edit-bus-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const busId = button.dataset.busId;
        startBusEdit(busId);
      });
    });

    document.querySelectorAll(".delete-bus-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const busId = button.dataset.busId;
        deleteBus(busId);
      });
    });
  }

  function renderStations() {
    if (!editStationsList) return;

    const stations = App.stationManager.getAllStations();

    if (!stations || stations.length === 0) {
      editStationsList.innerHTML = "<p>No stations available.</p>";
      return;
    }

    editStationsList.innerHTML = stations.map((station) => {
      const isRefuel = station.fuelType !== undefined;
      const typeLabel = isRefuel ? `Fuel Type: ${station.fuelType}` : `Station Type: ${station.stationType}`;

      return `
        <div class="admin-card">
          <p><strong>ID:</strong> ${station.id ?? "N/A"}</p>
          <p><strong>Name:</strong> ${station.name || "N/A"}</p>
          <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
          <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
          <p><strong>${isRefuel ? "Refuel Station" : "Bus Station"}</strong></p>
          <p><strong>${typeLabel}</strong></p>
          <div class="card-action-row">
            <button class="edit-station-btn" data-station-id="${station.id}" type="button">Edit</button>
            <button class="delete-station-btn" data-station-id="${station.id}" type="button">Delete</button>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".edit-station-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        startStationEdit(stationId);
      });
    });

    document.querySelectorAll(".delete-station-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.stationId;
        deleteStation(stationId);
      });
    });
  }

  function startBusEdit(busId) {
    const bus = App.busManager.findBusByID(busId);

    if (!bus) {
      alert("Bus not found.");
      return;
    }

    editingBusId.value = bus.id;
    busMake.value = bus.make || "";
    busModel.value = bus.model || "";
    busType.value = bus.type || "";
    busFuelType.value = bus.fuelType || "";
    busFuelTankSize.value = bus.fuelTankSize ?? "";
    busFuelBurnRate.value = bus.fuelBurnRate ?? "";
    busCruiseSpeed.value = bus.cruiseSpeed ?? "";

    busFormTitle.textContent = `Edit Bus #${bus.id}`;
    saveBusBtn.textContent = "Update Bus";
  }

  function startStationEdit(stationId) {
    const station = App.stationManager.findStationByID(stationId);

    if (!station) {
      alert("Station not found.");
      return;
    }

    const isRefuel = station.fuelType !== undefined;

    editingStationId.value = station.id;
    stationMode.value = isRefuel ? "refuel" : "bus";
    stationName.value = station.name || "";
    stationLatitude.value = station.latitude ?? "";
    stationLongitude.value = station.longitude ?? "";
    stationExtraField.value = isRefuel
      ? station.fuelType || ""
      : station.stationType || "";

    updateStationExtraFieldLabel();

    stationFormTitle.textContent = `Edit Station #${station.id}`;
    saveStationBtn.textContent = "Update Station";
  }

  function deleteBus(busId) {
    const confirmed = confirm("Delete this bus?");
    if (!confirmed) return;

    const deleted = App.busManager.removeBus(busId);

    if (!deleted) {
      alert("Failed to delete bus.");
      return;
    }

    if (editingBusId.value === String(busId)) {
      resetBusForm();
    }

    renderBuses();
    alert("Bus deleted successfully.");
  }

  function deleteStation(stationId) {
    const confirmed = confirm("Delete this station?");
    if (!confirmed) return;

    const deleted = App.stationManager.removeStation(stationId);

    if (!deleted) {
      alert("Failed to delete station.");
      return;
    }

    if (editingStationId.value === String(stationId)) {
      resetStationForm();
    }

    renderStations();
    alert("Station deleted successfully.");
  }

  function resetBusForm() {
    editingBusId.value = "";
    busMake.value = "";
    busModel.value = "";
    busType.value = "";
    busFuelType.value = "";
    busFuelTankSize.value = "";
    busFuelBurnRate.value = "";
    busCruiseSpeed.value = "";

    busFormTitle.textContent = "Add Bus";
    saveBusBtn.textContent = "Save Bus";
  }

  function resetStationForm() {
    editingStationId.value = "";
    stationMode.value = "bus";
    stationName.value = "";
    stationLatitude.value = "";
    stationLongitude.value = "";
    stationExtraField.value = "";

    updateStationExtraFieldLabel();

    stationFormTitle.textContent = "Add Station";
    saveStationBtn.textContent = "Save Station";
  }

  function updateStationExtraFieldLabel() {
    if (stationMode.value === "refuel") {
      stationExtraField.placeholder = "Fuel Type";
    } else {
      stationExtraField.placeholder = "Station Type";
    }
  }
});