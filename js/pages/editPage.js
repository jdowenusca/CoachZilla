// js/pages/editPage.js

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

  const addBusBtn = document.getElementById("addBusBtn");
  const addBusStationBtn = document.getElementById("addBusStationBtn");
  const addRefuelStationBtn = document.getElementById("addRefuelStationBtn");

  const editBusesList = document.getElementById("editBusesList");
  const editStationsList = document.getElementById("editStationsList");

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

  if (addBusBtn) {
    addBusBtn.addEventListener("click", () => {
      const make = document.getElementById("busMake").value.trim();
      const model = document.getElementById("busModel").value.trim();
      const type = document.getElementById("busType").value.trim();
      const fuelType = document.getElementById("busFuelType").value.trim();
      const fuelTankSize = parseFloat(document.getElementById("busFuelTankSize").value);
      const fuelBurnRate = parseFloat(document.getElementById("busFuelBurnRate").value);
      const cruiseSpeed = parseFloat(document.getElementById("busCruiseSpeed").value);

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

      App.busManager.addBus(
        make,
        model,
        type,
        fuelType,
        fuelTankSize,
        fuelBurnRate,
        cruiseSpeed
      );

      clearBusForm();
      renderBuses();
      alert("Bus added successfully.");
    });
  }

  if (addBusStationBtn) {
    addBusStationBtn.addEventListener("click", () => {
      const name = document.getElementById("busStationName").value.trim();
      const latitude = parseFloat(document.getElementById("busStationLatitude").value);
      const longitude = parseFloat(document.getElementById("busStationLongitude").value);
      const stationType = document.getElementById("busStationType").value.trim();

      if (
        !name ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        !stationType
      ) {
        alert("Please fill in all bus station fields correctly.");
        return;
      }

      App.stationManager.addBusStation(name, latitude, longitude, stationType);

      clearBusStationForm();
      renderStations();
      alert("Bus station added successfully.");
    });
  }

  if (addRefuelStationBtn) {
    addRefuelStationBtn.addEventListener("click", () => {
      const name = document.getElementById("refuelStationName").value.trim();
      const latitude = parseFloat(document.getElementById("refuelStationLatitude").value);
      const longitude = parseFloat(document.getElementById("refuelStationLongitude").value);
      const fuelType = document.getElementById("refuelFuelType").value.trim();

      if (
        !name ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        !fuelType
      ) {
        alert("Please fill in all refuel station fields correctly.");
        return;
      }

      App.stationManager.addRefuelStation(name, latitude, longitude, fuelType);

      clearRefuelStationForm();
      renderStations();
      alert("Refuel station added successfully.");
    });
  }

  renderBuses();
  renderStations();

  function renderBuses() {
    if (!editBusesList) return;

    const buses = App.busManager.getAllBuses();

    if (!buses || buses.length === 0) {
      editBusesList.innerHTML = "<p>No buses available.</p>";
      return;
    }

    editBusesList.innerHTML = buses.map(bus => `
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
    if (!editStationsList) return;

    const stations = App.stationManager.getAllStations();

    if (!stations || stations.length === 0) {
      editStationsList.innerHTML = "<p>No stations available.</p>";
      return;
    }

    editStationsList.innerHTML = stations.map(station => `
      <div class="admin-card">
        <p><strong>ID:</strong> ${station.id || "N/A"}</p>
        <p><strong>Name:</strong> ${station.name || "N/A"}</p>
        <p><strong>Latitude:</strong> ${station.latitude ?? "N/A"}</p>
        <p><strong>Longitude:</strong> ${station.longitude ?? "N/A"}</p>
        <p><strong>Type:</strong> ${station.stationType || station.fuelType || "N/A"}</p>
      </div>
    `).join("");
  }

  function clearBusForm() {
    document.getElementById("busMake").value = "";
    document.getElementById("busModel").value = "";
    document.getElementById("busType").value = "";
    document.getElementById("busFuelType").value = "";
    document.getElementById("busFuelTankSize").value = "";
    document.getElementById("busFuelBurnRate").value = "";
    document.getElementById("busCruiseSpeed").value = "";
  }

  function clearBusStationForm() {
    document.getElementById("busStationName").value = "";
    document.getElementById("busStationLatitude").value = "";
    document.getElementById("busStationLongitude").value = "";
    document.getElementById("busStationType").value = "";
  }

  function clearRefuelStationForm() {
    document.getElementById("refuelStationName").value = "";
    document.getElementById("refuelStationLatitude").value = "";
    document.getElementById("refuelStationLongitude").value = "";
    document.getElementById("refuelFuelType").value = "";
  }
});