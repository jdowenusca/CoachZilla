import AccountManager from "./managers/AccountManager.js";
import BusManager from "./managers/BusManager.js";
import StationManager from "./managers/StationManager.js";
import RoutePlanner from "./managers/RoutePlanner.js";
import TravelPlanManager from "./managers/TravelPlanManager.js";
import LeafletMapService from "./services/LeafletMapService.js";
import {
  qs,
  escapeHtml,
  setMessage,
  clearMessage,
  formatHoursToMinutes,
  getPageName,
  navigateTo,
  readJson,
  writeJson,
} from "./utils/helpers.js";

const accountManager = new AccountManager();
const busManager = new BusManager();
const stationManager = new StationManager();
const routePlanner = new RoutePlanner();
const travelPlanManager = new TravelPlanManager();
const mapService = new LeafletMapService();

const SESSION_KEY = "coachzilla_current_user";
const SIMPLE_TRAVEL_PLAN_KEY = "coachzilla_simple_travel_plan";

function seedPrototypeData() {
  accountManager.ensureDefaultAdmin();

  if (stationManager.getAllStations().length === 0) {
    stationManager.addBusStation("Campus Main Stop", 33.498, -81.968, "Campus Stop");
    stationManager.addBusStation("Library Transit Point", 33.4993, -81.9702, "Campus Stop");
    stationManager.addBusStation("Downtown Connector", 33.4735, -82.0105, "City Stop");
    stationManager.addRefuelStation("Diesel Station", 33.7, -81.5, "Diesel");
  }

  if (busManager.getAllBuses().length === 0) {
    busManager.addBus("Mercedes", "Tourismo", "Coach", "Diesel", 120, 2, 60);
    busManager.addBus("Volvo", "9700", "Campus Shuttle", "Diesel", 90, 2.2, 48);
    busManager.addBus("Blue Bird", "All American", "Regional", "Diesel", 110, 2.4, 55);
  }
}

function getCurrentUser() {
  return readJson(SESSION_KEY, null);
}

function setCurrentUser(user) {
  writeJson(SESSION_KEY, user);
}

function getSimpleTravelPlan() {
  return readJson(SIMPLE_TRAVEL_PLAN_KEY, []);
}

function saveSimpleTravelPlan(plan) {
  writeJson(SIMPLE_TRAVEL_PLAN_KEY, plan);
}

function login() {
  const username = qs("#username")?.value.trim() || "";
  const password = qs("#password")?.value.trim() || "";

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const user = accountManager.validateLogin(username, password);

  if (!user) {
    alert("Invalid username or password.");
    return;
  }

  setCurrentUser({
    userID: user.getUserID(),
    username: user.getUsername(),
    role: user.getRole(),
  });

  navigateTo(user.getRole().toLowerCase() === "admin" ? "admin.html" : "main.html");
}

function createAccount() {
  const usernameInput = qs("#newUsername");
  const passwordInput = qs("#newPassword");
  const message = qs("#createMessage");

  const username = usernameInput?.value.trim() || "";
  const password = passwordInput?.value.trim() || "";

  if (!username || !password) {
    setMessage(message, "Please fill in all fields.", true);
    return;
  }

  const newUser = accountManager.addUser(username, password, "user");

  if (!newUser) {
    setMessage(message, "Username already exists.", true);
    return;
  }

  setMessage(message, "Account created successfully. Redirecting...");
  usernameInput.value = "";
  passwordInput.value = "";

  setTimeout(() => navigateTo("index.html"), 1000);
}

function toggleStationDetails() {
  const details = qs("#station-details");
  if (details) {
    details.classList.toggle("hidden");
  }
}

function searchRoutes() {
  renderSearchResults(qs("#citySearch")?.value.trim() || "");
}

function addToTravelPlan(stopName) {
  const currentPlan = getSimpleTravelPlan();
  currentPlan.push(stopName);
  saveSimpleTravelPlan(currentPlan);
  updateTravelPlanPreview();
  renderTravelPlan();
}

function removeTravelStop(index) {
  const currentPlan = getSimpleTravelPlan();
  currentPlan.splice(index, 1);
  saveSimpleTravelPlan(currentPlan);
  updateTravelPlanPreview();
  renderTravelPlan();
}

function clearTravelPlan() {
  localStorage.removeItem(SIMPLE_TRAVEL_PLAN_KEY);
  updateTravelPlanPreview();
  renderTravelPlan();
}

function updateTravelPlanPreview() {
  const previewBox = qs("#travelPlanPreview");
  if (!previewBox) return;

  const currentPlan = getSimpleTravelPlan();

  if (!currentPlan.length) {
    previewBox.innerHTML = "<p>No stops added yet.</p>";
    return;
  }

  previewBox.innerHTML = currentPlan
    .map((stop, index) => `<p>${index + 1}. ${escapeHtml(stop)}</p>`)
    .join("");
}

function renderTravelPlan() {
  const travelPlanList = qs("#travelPlanList");
  if (!travelPlanList) return;

  const currentPlan = getSimpleTravelPlan();

  if (!currentPlan.length) {
    travelPlanList.innerHTML = `
      <div class="empty-plan-message">
        <p>Your travel plan is currently empty.</p>
        <p>Go to the Search page to add stops.</p>
      </div>
    `;
    return;
  }

  travelPlanList.innerHTML = currentPlan
    .map(
      (stop, index) => `
        <div class="travel-plan-item">
          <div class="travel-stop-info">
            <h3>Stop ${index + 1}</h3>
            <p><strong>Station:</strong> ${escapeHtml(stop)}</p>
            <p><strong>Status:</strong> Planned</p>
            <p><strong>Source:</strong> Local travel plan</p>
          </div>
          <button class="remove-btn" onclick="removeTravelStop(${index})">Remove</button>
        </div>
      `
    )
    .join("");
}

function renderSearchResults(searchTerm = "") {
  const resultsList = qs(".results-list");
  if (!resultsList) return;

  const busStations = stationManager.getAllBusStations();
  const filteredStations = !searchTerm
    ? busStations
    : busStations.filter((station) => {
        const name = station.getName().toLowerCase();
        const type = station.getStationType().toLowerCase();
        const query = searchTerm.toLowerCase();
        return name.includes(query) || type.includes(query);
      });

  if (!filteredStations.length) {
    resultsList.innerHTML = `
      <div class="result-card">
        <h3>No matching stations</h3>
        <p>Try another city or station name.</p>
      </div>
    `;
    return;
  }

  const defaultBus = busManager.getAllBuses()[0];
  const anchorStation = filteredStations[0];

  resultsList.innerHTML = filteredStations
    .map((station) => {
      const distance = routePlanner.calculateDistance(
        anchorStation.getLatitude(),
        anchorStation.getLongitude(),
        station.getLatitude(),
        station.getLongitude()
      );

      const travelTime = defaultBus
        ? routePlanner.calculateTravelTime(distance, defaultBus.getCruiseSpeed())
        : 0;

      const heading =
        station.getID() === anchorStation.getID()
          ? "Local Loop"
          : `${routePlanner.calculateHeading(
              anchorStation.getLatitude(),
              anchorStation.getLongitude(),
              station.getLatitude(),
              station.getLongitude()
            )}°`;

      return `
        <div class="result-card">
          <h3>${escapeHtml(station.getName())}</h3>
          <p><strong>Distance:</strong> ${distance.toFixed(2)} miles</p>
          <p><strong>Time:</strong> ${formatHoursToMinutes(travelTime)}</p>
          <p><strong>Heading:</strong> ${escapeHtml(heading)}</p>
          <button onclick="addToTravelPlan('${escapeHtml(station.getName())}')">Add</button>
        </div>
      `;
    })
    .join("");
}

function renderAdminUsers() {
  const usersList = qs("#adminUsersList");
  if (!usersList) return;

  const users = accountManager.getAllUsers();

  if (!users.length) {
    usersList.innerHTML = `<div class="admin-empty-message"><p>No users found.</p></div>`;
    return;
  }

  usersList.innerHTML = users
    .map(
      (user) => `
        <div class="admin-list-item">
          <div>
            <p><strong>${escapeHtml(user.getUsername())}</strong></p>
            <p>Role: ${escapeHtml(user.getRole())}</p>
            <p>ID: ${user.getUserID()}</p>
          </div>
          <button onclick="removeUser(${user.getUserID()})">Remove</button>
        </div>
      `
    )
    .join("");
}

function removeUser(userID) {
  const currentUser = getCurrentUser();
  if (currentUser && Number(currentUser.userID) === Number(userID)) {
    alert("You cannot remove the currently logged-in user.");
    return;
  }

  accountManager.removeUser(userID);
  renderAdminUsers();
}

function renderAdminStations() {
  const stationsList = qs("#adminStationsList");
  if (!stationsList) return;

  const stations = stationManager.getAllStations();

  if (!stations.length) {
    stationsList.innerHTML = `<div class="admin-empty-message"><p>No stations found.</p></div>`;
    return;
  }

  stationsList.innerHTML = stations
    .map((station) => {
      const extraLine = typeof station.getFuelType === "function"
        ? `Fuel Type: ${escapeHtml(station.getFuelType())}`
        : `Type: ${escapeHtml(station.getStationType())}`;

      return `
        <div class="admin-list-item">
          <div>
            <p><strong>${escapeHtml(station.getName())}</strong></p>
            <p>${extraLine}</p>
            <p>Coords: ${station.getLatitude()}, ${station.getLongitude()}</p>
          </div>
          <button onclick="removeStation(${station.getID()})">Remove</button>
        </div>
      `;
    })
    .join("");
}

function removeStation(stationID) {
  stationManager.removeStation(stationID);
  renderAdminStations();
  renderSearchResults();
}

function renderAdminBuses() {
  const busesList = qs("#adminBusesList");
  if (!busesList) return;

  const buses = busManager.getAllBuses();

  if (!buses.length) {
    busesList.innerHTML = `<div class="admin-empty-message"><p>No buses found.</p></div>`;
    return;
  }

  busesList.innerHTML = buses
    .map(
      (bus) => `
        <div class="admin-list-item">
          <div>
            <p><strong>${escapeHtml(`${bus.getMake()} ${bus.getModel()}`)}</strong></p>
            <p>Type: ${escapeHtml(bus.getType())}</p>
            <p>Fuel: ${escapeHtml(bus.getFuelType())}</p>
          </div>
          <button onclick="removeBus(${bus.getID()})">Remove</button>
        </div>
      `
    )
    .join("");
}

function removeBus(busID) {
  busManager.removeBus(busID);
  renderAdminBuses();
}

function addUserFromAdmin() {
  const usernameInput = qs("#editUsername");
  const passwordInput = qs("#editPassword");
  const roleInput = qs("#editUserRole");
  const message = qs("#editUserMessage");

  const username = usernameInput?.value.trim() || "";
  const password = passwordInput?.value.trim() || "";
  const role = roleInput?.value || "user";

  if (!username || !password) {
    setMessage(message, "Please fill in all user fields.", true);
    return;
  }

  const createdUser = accountManager.addUser(username, password, role);

  if (!createdUser) {
    setMessage(message, "That username already exists.", true);
    return;
  }

  setMessage(message, "User added successfully.");
  usernameInput.value = "";
  passwordInput.value = "";
  roleInput.value = "user";
}

function addStation() {
  const nameInput = qs("#stationName");
  const statusInput = qs("#stationStatus");
  const locationInput = qs("#stationLocation");
  const message = qs("#stationMessage");

  const name = nameInput?.value.trim() || "";
  const stationType = statusInput?.value.trim() || "";
  const locationText = locationInput?.value.trim() || "";

  if (!name || !stationType || !locationText) {
    setMessage(message, "Please fill in all station fields.", true);
    return;
  }

  const [latitudeText = "33.5000", longitudeText = "-81.9700"] = locationText.split(",");
  const latitude = Number(latitudeText.trim());
  const longitude = Number(longitudeText.trim());

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    setMessage(message, 'Location must be entered like "33.5000, -81.9700".', true);
    return;
  }

  stationManager.addBusStation(name, latitude, longitude, stationType);
  setMessage(message, "Station added successfully.");
  nameInput.value = "";
  statusInput.value = "";
  locationInput.value = "";
}

function addBus() {
  const nameInput = qs("#busName");
  const routeInput = qs("#busRoute");
  const statusInput = qs("#busStatus");
  const message = qs("#busMessage");

  const make = nameInput?.value.trim() || "";
  const model = routeInput?.value.trim() || "";
  const type = statusInput?.value.trim() || "";

  if (!make || !model || !type) {
    setMessage(message, "Please fill in all bus fields.", true);
    return;
  }

  busManager.addBus(make, model, type, "Diesel", 100, 2, 55);
  setMessage(message, "Bus added successfully.");
  nameInput.value = "";
  routeInput.value = "";
  statusInput.value = "";
}

function renderMainDashboard() {
  const busStations = stationManager.getAllBusStations();
  const buses = busManager.getAllBuses();
  const details = qs("#station-details");
  const infoCard = qs(".info-card");
  const quickCard = qs(".mini-card");
  const mapContainer = qs(".map-placeholder");

  if (!busStations.length) return;

  const primaryStation = busStations[0];
  const defaultBus = buses[0];

  if (infoCard) {
    infoCard.innerHTML = `
      <h3>${escapeHtml(primaryStation.getName())}</h3>
      <p><strong>Bus Route:</strong> ${escapeHtml(defaultBus ? defaultBus.getModel() : "Not assigned")}</p>
      <p><strong>Status:</strong> Active</p>
      <p><strong>Location:</strong> ${primaryStation.getLatitude()}, ${primaryStation.getLongitude()}</p>
      <p class="click-note">Click for more details</p>
    `;
  }

  if (details) {
    details.innerHTML = `
      <h3>Station Details</h3>
      <p><strong>Station Name:</strong> ${escapeHtml(primaryStation.getName())}</p>
      <p><strong>Station Type:</strong> ${escapeHtml(primaryStation.getStationType())}</p>
      <p><strong>Latitude:</strong> ${primaryStation.getLatitude()}</p>
      <p><strong>Longitude:</strong> ${primaryStation.getLongitude()}</p>
      <p><strong>Notes:</strong> Prototype data powered by StationManager.</p>
    `;
  }

  if (quickCard) {
    quickCard.innerHTML = `
      <h3>Default View</h3>
      <p>${busStations.length} station(s) available</p>
      <p>${buses.length} bus(es) in local storage</p>
    `;
  }

  mapService.renderStationMap(mapContainer, busStations);
}

function maybeCreatePrototypeTravelPlan() {
  const pageName = getPageName();
  if (pageName !== "travel.html") return;

  const currentUser = getCurrentUser();
  const stations = stationManager.getAllBusStations();
  const buses = busManager.getAllBuses();

  if (!currentUser || stations.length < 2 || !buses.length) return;
  if (travelPlanManager.getTravelPlansByUser(currentUser.userID).length > 0) return;

  travelPlanManager.createTravelPlan(currentUser, buses[0], stations.slice(0, 2), stationManager.getAllRefuelStations());
}

function initializePage() {
  seedPrototypeData();
  maybeCreatePrototypeTravelPlan();
  updateTravelPlanPreview();
  renderTravelPlan();
  renderAdminUsers();
  renderAdminStations();
  renderAdminBuses();
  renderSearchResults();
  renderMainDashboard();

  const searchInput = qs("#citySearch");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      renderSearchResults(event.target.value.trim());
    });
  }
}

window.login = login;
window.createAccount = createAccount;
window.toggleStationDetails = toggleStationDetails;
window.searchRoutes = searchRoutes;
window.addToTravelPlan = addToTravelPlan;
window.removeTravelStop = removeTravelStop;
window.clearTravelPlan = clearTravelPlan;
window.removeUser = removeUser;
window.removeStation = removeStation;
window.removeBus = removeBus;
window.addUserFromAdmin = addUserFromAdmin;
window.addStation = addStation;
window.addBus = addBus;
window.goToCreate = () => navigateTo("create.html");
window.goToAbout = () => navigateTo("about.html");
window.goToSearch = () => navigateTo("search.html");
window.goToTravelPlan = () => navigateTo("travel.html");
window.goToMain = () => navigateTo("main.html");
window.goToLogin = () => navigateTo("index.html");
window.goToEdit = () => navigateTo("edit.html");
window.goToAdmin = () => navigateTo("admin.html");

document.addEventListener("DOMContentLoaded", initializePage);
