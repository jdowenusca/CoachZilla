// Travel plan page behavior, display, and route summary rendering.
import { App } from "../app/app.js";
import { formatHoursToXXYY } from "../utils/helpers.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());
  const urlParams = new URLSearchParams(window.location.search);
  const activeTravelPlanId = urlParams.get("planId");

  if (!storedUser) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
    return;
  }

  if (!activeTravelPlanId) {
    alert("No active travel plan found.");
    window.location.href = "search.html";
    return;
  }

  App.currentUser = storedUser;

  const backHomeBtn = document.getElementById("backHomeBtn");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const travelPlanContainer = document.getElementById("travelPlanContainer");
  const routeLegsContainer = document.getElementById("routeLegsContainer");
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  const deletePlanBtn = document.getElementById("deletePlanBtn");
  const statusSelect = document.getElementById("statusSelect");

  let activePlan = App.travelPlanManager.getPlanById(activeTravelPlanId);

  if (!activePlan) {
    alert("Travel plan not found.");
    window.location.href = "search.html";
    return;
  }

  if (String(activePlan.userId) !== String(storedUser.userID)) {
    alert("You do not have access to this travel plan.");
    window.location.href = "search.html";
    return;
  }

  renderTravelPlan(activePlan);

  if (statusSelect) {
    statusSelect.value = activePlan.status || "planned";
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
    logoutBtn.addEventListener("click", async () => {
      await App.authService.signOut();
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  if (updateStatusBtn && statusSelect) {
    updateStatusBtn.addEventListener("click", async () => {
      const newStatus = statusSelect.value;

      const updatedPlan = await App.travelPlanManager.updatePlanStatus(
        activeTravelPlanId,
        newStatus
      );

      if (!updatedPlan) {
        alert("Failed to update status.");
        return;
      }

      activePlan = updatedPlan;
      renderTravelPlan(activePlan);
      statusSelect.value = activePlan.status || "planned";
      alert("Travel plan status updated.");
    });
  }

  if (deletePlanBtn) {
    deletePlanBtn.addEventListener("click", async () => {
      const confirmed = confirm("Delete this travel plan?");
      if (!confirmed) return;

      await App.travelPlanManager.deletePlan(activeTravelPlanId);

      alert("Travel plan deleted.");
      window.location.href = "search.html";
    });
  }

  function renderTravelPlan(plan) {
    if (!travelPlanContainer || !routeLegsContainer) return;

    const route = plan.route || {};
    const legs = Array.isArray(route.legs) ? route.legs : [];

    const bus = App.busManager.getAllBuses().find(
      (b) => String(b.id) === String(plan.selectedBusId)
    );

    const selectedStations = Array.isArray(plan.destinations)
      ? plan.destinations
          .map((stationId) => App.stationManager.findStationByID(stationId))
          .filter(Boolean)
      : [];

    travelPlanContainer.innerHTML = `
      <div class="admin-card">
        <p><strong>Plan ID:</strong> ${plan.travelPlanId}</p>
        <p><strong>Status:</strong> ${formatStatus(plan.status)}</p>
        <p><strong>Bus:</strong> ${formatBus(bus, plan.selectedBusId)}</p>
        <p><strong>Total Distance:</strong> ${formatNumber(route.totalDistance)} miles</p>
        <p><strong>Total Time:</strong> ${formatHoursToXXYY(route.totalTime)}</p>
        <p><strong>Stops Selected:</strong> ${selectedStations.length}</p>
        <p><strong>Created:</strong> ${formatDate(plan.createdAt)}</p>
        <p><strong>Updated:</strong> ${formatDate(plan.updatedAt)}</p>
      </div>

      <div class="admin-card">
        <h3>Selected Stops</h3>
        ${
          selectedStations.length === 0
            ? "<p>No selected stops found.</p>"
            : selectedStations
                .map((station, index) => {
                  let roleLabel = "Stop";

                  if (index === 0) roleLabel = "Start";
                  else if (index === selectedStations.length - 1) roleLabel = "End";
                  else roleLabel = `Stop ${index}`;

                  const typeLabel = station.stationType || station.fuelType || "Station";

                  return `
                    <p>
                      <strong>${roleLabel}:</strong>
                      ${station.name}
                      (${typeLabel})
                    </p>
                  `;
                })
                .join("")
        }
      </div>
    `;

    routeLegsContainer.innerHTML =
      legs.length === 0
        ? `<div class="admin-card"><p>No route legs found.</p></div>`
        : legs
            .map((leg, index) => {
              const startName = leg.startStation?.name || "Unknown Start";
              const endName = leg.endStation?.name || "Unknown End";

              const startType =
                leg.startStation?.stationType ||
                leg.startStation?.fuelType ||
                "Station";

              const endType =
                leg.endStation?.stationType ||
                leg.endStation?.fuelType ||
                "Station";

              return `
                <div class="admin-card">
                  <p><strong>Leg ${index + 1}</strong></p>
                  <p><strong>From:</strong> ${startName} (${startType})</p>
                  <p><strong>To:</strong> ${endName} (${endType})</p>
                  <p><strong>Distance:</strong> ${formatNumber(leg.distance)} miles</p>
                  <p><strong>Time:</strong> ${formatHoursToXXYY(leg.timeToDestination)}</p>
                  <p><strong>Heading:</strong> ${formatNumber(leg.heading)}°</p>
                  <p><strong>Refuel Stop:</strong> ${leg.isRefuelStop ? "Yes" : "No"}</p>
                </div>
              `;
            })
            .join("");
  }

  function formatBus(bus, fallbackBusId) {
    if (!bus) {
      return `Bus ID ${fallbackBusId}`;
    }

    return `${bus.make} ${bus.model} (${bus.fuelType})`;
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return String(status)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatNumber(value) {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "0.00";
    }

    return numericValue.toFixed(2);
  }

  function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }
});