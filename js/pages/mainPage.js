// Main dashboard page logic and map setup.

import { App } from "../app/app.js";
import LeafletMapService from "../services/LeafletMapService.js";

window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const welcomeMessage = document.getElementById("welcomeMessage");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goTravelBtn = document.getElementById("goTravelBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const mainMap = document.getElementById("mainMap");
  const activePlansList = document.getElementById("activeTravelPlansList");

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

  if (goSearchBtn) {
    goSearchBtn.addEventListener("click", () => {
      window.location.href = "search.html";
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


  if (mainMap && typeof L !== "undefined") {
    try {
      const mapService = new LeafletMapService();
      const uscAikenCoords = [33.573420, -81.766009];
      mapService.initializeMap("mainMap", uscAikenCoords, 15);

      L.marker(uscAikenCoords)
        .addTo(mapService.map)
        .bindPopup("University of South Carolina Aiken")
        .openPopup();

      // Add click event to show coordinates
      mapService.map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        alert(`Clicked location:\nLatitude: ${lat}\nLongitude: ${lng}`);
      });
    } catch (error) {
      console.error("Failed to initialize main page map:", error);
    }
  }

  renderActiveTravelPlans();

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await App.authService.signOut();
      App.currentUser = null;
      window.location.href = "index.html";
    });
  }

  function renderActiveTravelPlans() {
    if (!activePlansList) return;

    const plans = App.travelPlanManager.getPlansByUser(storedUser.userID || storedUser.userId);

    if (!plans || plans.length === 0) {
      activePlansList.innerHTML = "<p>No active travel plans available.</p>";
      return;
    }

    const buses = App.busManager.getAllBuses();

    activePlansList.innerHTML = plans
      .map((plan) => {
        const bus = buses.find((b) => String(b.id) === String(plan.selectedBusId)) ||
          buses.find((b) => String(b.getID ? b.getID() : b.id) === String(plan.selectedBusId));
        const busLabel = bus ? `${bus.make} ${bus.model} (${bus.fuelType})` : "Unknown bus";
        const stopCount = plan.destinations ? plan.destinations.length : 0;
        const createdDate = plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "Unknown";

        return `
          <div class="admin-card">
            <p><strong>Plan ID:</strong> ${plan.travelPlanId}</p>
            <p><strong>Bus:</strong> ${busLabel}</p>
            <p><strong>Stops:</strong> ${stopCount}</p>
            <p><strong>Status:</strong> ${plan.status || "planned"}</p>
            <p><strong>Created:</strong> ${createdDate}</p>
            <div class="plan-actions">
              <button class="edit-plan-btn" data-plan-id="${plan.travelPlanId}" type="button">Edit</button>
              <button class="remove-plan-btn" data-plan-id="${plan.travelPlanId}" type="button">Remove</button>
            </div>
          </div>
        `;
      })
      .join("");

    const editButtons = document.querySelectorAll(".edit-plan-btn");
    const removeButtons = document.querySelectorAll(".remove-plan-btn");

    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const planId = button.dataset.planId;
        window.location.href = `travel.html?planId=${encodeURIComponent(planId)}`;
      });
    });

    removeButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const planId = button.dataset.planId;
        if (confirm("Are you sure you want to delete this travel plan?")) {
          try {
            await App.travelPlanManager.deletePlan(planId);
            renderActiveTravelPlans();
          } catch (error) {
            console.error("Failed to delete plan:", error);
            alert("Failed to delete the travel plan.");
          }
        }
      });
    });
  }
});