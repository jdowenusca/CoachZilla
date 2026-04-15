// js/pages/mainPage.js

import { App } from "../app/app.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const welcomeMessage = document.getElementById("welcomeMessage");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goTravelBtn = document.getElementById("goTravelBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());

  if (!storedUser) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
    return;
  }

  App.currentUser = storedUser;

  if (welcomeMessage) {
    const displayName =
      storedUser.username || "User";
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
  }

  renderUserTravelPlans();

  if (goSearchBtn) {
    goSearchBtn.addEventListener("click", () => {
      window.location.href = "search.html";
    });
  }

  if (goTravelBtn) {
    goTravelBtn.addEventListener("click", () => {
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
});

function renderUserTravelPlans() {
  if (!App.currentUser || !App.currentUser.userID) {
    return;
  }
  const travelPlansList = document.getElementById("travelPlansList");
  const userPlans = App.travelPlanManager.getPlansByUser(App.currentUser.userID);

  if (!travelPlansList) return;

  if (!userPlans.length) {
    travelPlansList.innerHTML = `<p>You have no travel plans yet. Create one by searching routes!</p>`;
    return;
  }

  travelPlansList.innerHTML = userPlans.map((plan) => {
    const bus = App.busManager.findBusByID(plan.selectedBusId);
    const stopCount = Array.isArray(plan.destinations) ? plan.destinations.length : 0;
    const route = plan.route || {};

    return `
      <div class="plan-card">
        <h3>Plan ${plan.travelPlanId}</h3>
        <p><strong>Status:</strong> ${plan.status || "planned"}</p>
        <p><strong>Bus:</strong> ${bus ? `${bus.make} ${bus.model}` : `Bus ID ${plan.selectedBusId}`}</p>
        <p><strong>Stops:</strong> ${stopCount}</p>
        <p><strong>Distance:</strong> ${route.totalDistance ? route.totalDistance.toFixed(2) : "0.00"} miles</p>
        <div class="plan-card-actions">
          <button onclick="window.location.href='travel.html?planId=${encodeURIComponent(plan.travelPlanId)}'">View Plan</button>
          <button onclick="handleDeletePlan('${plan.travelPlanId}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  // Attach delete event listeners - removed, using inline onclick instead
}

async function deleteTravelPlan(planId) {
  try {
    await App.travelPlanManager.deletePlan(planId);
    renderUserTravelPlans();
  } catch (err) {
    console.error("Failed to delete travel plan:", err);
    alert("Failed to delete travel plan.");
  }
}

// Global function for inline onclick handlers
window.handleDeletePlan = async function(planId) {
  if (confirm(`Are you sure you want to delete this travel plan? This action cannot be undone.`)) {
    await deleteTravelPlan(planId);
  }
};