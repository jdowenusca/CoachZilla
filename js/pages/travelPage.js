// js/pages/travelPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  App.init();

  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const activeTravelPlanId = localStorage.getItem("activeTravelPlanId");

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
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  const deletePlanBtn = document.getElementById("deletePlanBtn");
  const statusSelect = document.getElementById("statusSelect");

  let activePlan = App.travelPlanManager.getPlanById(activeTravelPlanId);

  if (!activePlan) {
    alert("Travel plan not found.");
    localStorage.removeItem("activeTravelPlanId");
    window.location.href = "search.html";
    return;
  }

  if (activePlan.userId !== storedUser.userID) {
    alert("You do not have access to this travel plan.");
    window.location.href = "search.html";
    return;
  }

  renderTravelPlan(activePlan);

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
      localStorage.removeItem("activeTravelPlanId");
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  if (updateStatusBtn && statusSelect) {
    updateStatusBtn.addEventListener("click", () => {
      const newStatus = statusSelect.value;

      const updatedPlan = App.travelPlanManager.updatePlanStatus(
        activeTravelPlanId,
        newStatus
      );

      if (!updatedPlan) {
        alert("Failed to update status.");
        return;
      }

      activePlan = updatedPlan;
      renderTravelPlan(activePlan);
      alert("Travel plan status updated.");
    });
  }

  if (deletePlanBtn) {
    deletePlanBtn.addEventListener("click", () => {
      const confirmed = confirm("Delete this travel plan?");
      if (!confirmed) return;

      App.travelPlanManager.deletePlan(activeTravelPlanId);
      localStorage.removeItem("activeTravelPlanId");

      alert("Travel plan deleted.");
      window.location.href = "search.html";
    });
  }

  function renderTravelPlan(plan) {
    if (!travelPlanContainer) return;

    const route = plan.route || {};
    const legs = route.legs || [];

    travelPlanContainer.innerHTML = `
      <div class="admin-card">
        <p><strong>Plan ID:</strong> ${plan.travelPlanId}</p>
        <p><strong>Status:</strong> ${plan.status}</p>
        <p><strong>Bus ID:</strong> ${plan.selectedBusId}</p>
        <p><strong>Total Distance:</strong> ${route.totalDistance ?? 0}</p>
        <p><strong>Total Time:</strong> ${route.totalTime ?? 0}</p>
        <p><strong>Created:</strong> ${plan.createdAt || "N/A"}</p>
        <p><strong>Updated:</strong> ${plan.updatedAt || "N/A"}</p>
      </div>

      <h3>Route Legs</h3>

      ${
        legs.length === 0
          ? "<p>No route legs found.</p>"
          : legs
              .map(
                (leg, index) => `
                  <div class="admin-card">
                    <p><strong>Leg ${index + 1}</strong></p>
                    <p><strong>Start Station ID:</strong> ${leg.startStationId}</p>
                    <p><strong>End Station ID:</strong> ${leg.endStationId}</p>
                    <p><strong>Distance:</strong> ${leg.distance}</p>
                    <p><strong>Time:</strong> ${leg.timeToDestination}</p>
                    <p><strong>Heading:</strong> ${leg.heading}</p>
                    <p><strong>Refuel Stop:</strong> ${leg.isRefuelStop ? "Yes" : "No"}</p>
                  </div>
                `
              )
              .join("")
      }
    `;
  }
});