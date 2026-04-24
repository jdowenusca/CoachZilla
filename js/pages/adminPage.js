// Admin dashboard page behavior and user management.
import { App } from "../app/app.js";
import { formatHoursToXXYY } from "../utils/helpers.js";
window.addEventListener("DOMContentLoaded", async () => {
  await App.init();

  const storedUser = App.currentUser || (await App.authService.getCurrentUserProfile());

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

  const goEditBtn = document.getElementById("goEditBtn");
  const goSearchBtn = document.getElementById("goSearchBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const adminWelcome = document.getElementById("adminWelcome");
  const summaryCards = document.getElementById("summaryCards");

  const recentUsersList = document.getElementById("recentUsersList");
  const recentBusesList = document.getElementById("recentBusesList");
  const recentStationsList = document.getElementById("recentStationsList");
  const recentPlansList = document.getElementById("recentPlansList");

  setupNavigation();
  renderWelcome();
  renderSummary();
  renderUsers();
  renderBuses();
  renderStations();
  renderTravelPlans();

  function setupNavigation() {
    if (goEditBtn) {
      goEditBtn.addEventListener("click", () => {
        window.location.href = "edit.html";
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
  }

  function renderWelcome() {
    if (!adminWelcome) return;

    adminWelcome.innerHTML = `
      <div class="admin-card">
        <h2>Welcome, ${storedUser.firstName || storedUser.username || "Admin"}.</h2>
        <p>
          This dashboard gives you a quick overview of the current CoachZilla
          data set and shortcuts to manage buses, stations, and route planning.
        </p>
      </div>
    `;
  }

  function renderSummary() {
    if (!summaryCards) return;

    const users = App.accountManager.getAllUsers();
    const buses = App.busManager.getAllBuses();
    const stations = App.stationManager.getAllStations();
    const plans = App.travelPlanManager.getAllPlans();

    const refuelStations = stations.filter((station) => station.fuelType !== undefined);
    const busStations = stations.filter((station) => station.stationType !== undefined);

    summaryCards.innerHTML = `
      <div class="admin-card">
        <h3>Users</h3>
        <p><strong>Total:</strong> ${users.length}</p>
      </div>

      <div class="admin-card">
        <h3>Buses</h3>
        <p><strong>Total:</strong> ${buses.length}</p>
      </div>

      <div class="admin-card">
        <h3>Stations</h3>
        <p><strong>Total:</strong> ${stations.length}</p>
        <p><strong>Bus Stations:</strong> ${busStations.length}</p>
        <p><strong>Refuel Stations:</strong> ${refuelStations.length}</p>
      </div>

      <div class="admin-card">
        <h3>Travel Plans</h3>
        <p><strong>Total:</strong> ${plans.length}</p>
      </div>
    `;
  }

  function renderUsers() {
    if (!recentUsersList) return;

    const users = App.accountManager.getAllUsers();

    if (!users.length) {
      recentUsersList.innerHTML = `<p>No users found.</p>`;
      return;
    }

    recentUsersList.innerHTML = users
      .slice(-5)
      .reverse()
      .map((user) => {
        const isCurrentAdmin = String(user.userID) === String(storedUser.userID);

        return `
          <div class="admin-card">
            <p><strong>User ID:</strong> ${user.userID ?? "N/A"}</p>
            <p><strong>Name:</strong> ${user.firstName || ""} ${user.lastName || ""}</p>
            <p><strong>Username:</strong> ${user.username || "N/A"}</p>
            <p><strong>Role:</strong> ${user.role || "user"}</p>
            <button class="delete-user-btn" data-user-id="${user.userID || ""}" ${isCurrentAdmin ? "disabled" : ""}>
              ${isCurrentAdmin ? "Current Admin" : "Delete User"}
            </button>
          </div>
        `;
      })
      .join("");

    const deleteUserButtons = document.querySelectorAll(".delete-user-btn");
    deleteUserButtons.forEach((button) => {
      if (button.disabled) return;
      button.addEventListener("click", async () => {
        const userId = button.dataset.userId;
        if (!userId) return;

        const confirmed = confirm("Delete this user and remove their Firestore profile?");
        if (!confirmed) return;

        await deleteUser(userId);
      });
    });
  }

  async function deleteUser(userId) {
    try {
      const success = await App.accountManager.removeUser(userId);
      if (!success) {
        alert("Could not delete user. The user may not exist.");
        return;
      }
      renderUsers();
      renderSummary();
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user.");
    }
  }

  function renderBuses() {
    if (!recentBusesList) return;

    const buses = App.busManager.getAllBuses();

    if (!buses.length) {
      recentBusesList.innerHTML = `<p>No buses found.</p>`;
      return;
    }

    recentBusesList.innerHTML = buses
      .slice(-5)
      .reverse()
      .map((bus) => `
        <div class="admin-card">
          <p><strong>ID:</strong> ${bus.id ?? "N/A"}</p>
          <p><strong>Bus:</strong> ${bus.make || "N/A"} ${bus.model || ""}</p>
          <p><strong>Type:</strong> ${bus.type || "N/A"}</p>
          <p><strong>Fuel:</strong> ${bus.fuelType || "N/A"}</p>
          <p><strong>Range Basis:</strong> Tank ${bus.fuelTankSize ?? "N/A"} / Burn ${bus.fuelBurnRate ?? "N/A"}</p>
        </div>
      `)
      .join("");
  }

  function renderStations() {
    if (!recentStationsList) return;

    const stations = App.stationManager.getAllStations();

    if (!stations.length) {
      recentStationsList.innerHTML = `<p>No stations found.</p>`;
      return;
    }

    recentStationsList.innerHTML = stations
      .slice(-5)
      .reverse()
      .map((station) => {
        const isRefuel = station.fuelType !== undefined;
        const detailLabel = isRefuel
          ? `Fuel Type: ${station.fuelType || "N/A"}`
          : `Station Type: ${station.stationType || "N/A"}`;

        return `
          <div class="admin-card">
            <p><strong>ID:</strong> ${station.id ?? "N/A"}</p>
            <p><strong>Name:</strong> ${station.name || "N/A"}</p>
            <p><strong>Category:</strong> ${isRefuel ? "Refuel Station" : "Bus Station"}</p>
            <p><strong>${detailLabel}</strong></p>
            <p><strong>Coords:</strong> ${station.latitude ?? "N/A"}, ${station.longitude ?? "N/A"}</p>
          </div>
        `;
      })
      .join("");
  }

  function renderTravelPlans() {
    if (!recentPlansList) return;

    const plans = App.travelPlanManager.getAllPlans();

    if (!plans.length) {
      recentPlansList.innerHTML = `<p>No travel plans found.</p>`;
      return;
    }

    recentPlansList.innerHTML = plans
      .slice(-5)
      .reverse()
      .map((plan) => {
        const bus = App.busManager.getAllBuses().find(
          (b) => String(b.id) === String(plan.selectedBusId)
        );

        const stopCount = Array.isArray(plan.destinations) ? plan.destinations.length : 0;
        const route = plan.route || {};

        return `
          <div class="admin-card">
            <p><strong>Plan ID:</strong> ${plan.travelPlanId ?? "N/A"}</p>
            <p><strong>User ID:</strong> ${plan.userId ?? "N/A"}</p>
            <p><strong>Status:</strong> ${formatStatus(plan.status)}</p>
            <p><strong>Bus:</strong> ${
              bus ? `${bus.make} ${bus.model}` : `Bus ID ${plan.selectedBusId ?? "N/A"}`
            }</p>
            <p><strong>Stops:</strong> ${stopCount}</p>
            <p><strong>Total Distance:</strong> ${formatNumber(route.totalDistance)}</p>
            <p><strong>Total Time:</strong> ${formatHoursToXXYY(route.totalTime)}</p>
          </div>
        `;
      })
      .join("");
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
    if (Number.isNaN(numericValue)) return "0.00";
    return numericValue.toFixed(2);
  }
});