//Author: Judah Owen
//Edited by: (editor name)

//temporary add to text import functions and test data creation
import User from "./models/User.js";
import Bus from "./models/Bus.js";
import BusStation from "./models/BusStation.js";
import RefuelStation from "./models/RefuelStation.js";

const testUser = new User(1, "admin", "admin123", "admin");
const testBus = new Bus(101, "Ford", "Transit", "Passenger", "Gasoline", 25, 0.2, 65);
const testBusStation = new BusStation(201, "Downtown Station", 33.5007, -81.9998);
const testRefuelStation = new RefuelStation(301, "Fuel Stop", 33.5201, -82.0105, "Gasoline");

console.log(testUser.displayInfo());
console.log(testBus.displayInfo());
console.log("Max Range:", testBus.calculateMaxRange());
console.log(testBusStation.displayInfo());
console.log(testRefuelStation.displayInfo());

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArSEe1C58SRhosnESKcKGfUAyjWvnc_lQ",
  authDomain: "coachzilla-565ed.firebaseapp.com",
  projectId: "coachzilla-565ed",
  storageBucket: "coachzilla-565ed.firebasestorage.app",
  messagingSenderId: "299534468128",
  appId: "1:299534468128:web:18c373867c67628c826845",
  measurementId: "G-G7ZYE1CJHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(user =>
        user.username === username && user.password === password
    );

    if (!foundUser) {
        alert("Invalid username or password.");
        return;
    }

    // Save current user session (for later use)
    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    if (foundUser.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "main.html";
    }
}

function goToCreate() {
    window.location.href = "create.html";
}

function goToAbout() {
    window.location.href = "about.html";
}

function goToSearch() {
    window.location.href = "search.html";
}

function goToTravelPlan() {
    window.location.href = "travel.html";
}

function toggleStationDetails() {
    const details = document.getElementById("station-details");
    details.classList.toggle("hidden");
}

function goToMain() {
    window.location.href = "main.html";
}

function goToLogin() {
    window.location.href = "index.html";
}

function searchRoutes() {
    const searchInput = document.getElementById("citySearch").value.trim();

    if (searchInput === "") {
        alert("Please enter a city or station name.");
        return;
    }

    alert("Search feature is in prototype mode. Showing placeholder route results for: " + searchInput);
}

function addToTravelPlan(stopName) {
    let travelPlan = JSON.parse(localStorage.getItem("travelPlan")) || [];
    travelPlan.push(stopName);
    localStorage.setItem("travelPlan", JSON.stringify(travelPlan));
    updateTravelPlanPreview();
}

function updateTravelPlanPreview() {
    const previewBox = document.getElementById("travelPlanPreview");
    if (!previewBox) return;

    let travelPlan = JSON.parse(localStorage.getItem("travelPlan")) || [];

    if (travelPlan.length === 0) {
        previewBox.innerHTML = "<p>No stops added yet.</p>";
        return;
    }

    previewBox.innerHTML = "";
    travelPlan.forEach((stop, index) => {
        const stopItem = document.createElement("p");
        stopItem.textContent = (index + 1) + ". " + stop;
        previewBox.appendChild(stopItem);
    });
}

function renderTravelPlan() {
    const travelPlanList = document.getElementById("travelPlanList");
    if (!travelPlanList) return;

    let travelPlan = JSON.parse(localStorage.getItem("travelPlan")) || [];

    if (travelPlan.length === 0) {
        travelPlanList.innerHTML = `
            <div class="empty-plan-message">
                <p>Your travel plan is currently empty.</p>
                <p>Go to the Search page to add stops.</p>
            </div>
        `;
        return;
    }

    travelPlanList.innerHTML = "";

    travelPlan.forEach((stop, index) => {
        const travelItem = document.createElement("div");
        travelItem.className = "travel-plan-item";

        travelItem.innerHTML = `
            <div class="travel-stop-info">
                <h3>Stop ${index + 1}</h3>
                <p><strong>Station:</strong> ${stop}</p>
                <p><strong>Status:</strong> Planned</p>
                <p><strong>Source:</strong> Local travel plan</p>
            </div>
            <button class="remove-btn" onclick="removeTravelStop(${index})">Remove</button>
        `;

        travelPlanList.appendChild(travelItem);
    });
}

function removeTravelStop(index) {
    let travelPlan = JSON.parse(localStorage.getItem("travelPlan")) || [];
    travelPlan.splice(index, 1);
    localStorage.setItem("travelPlan", JSON.stringify(travelPlan));
    renderTravelPlan();
    updateTravelPlanPreview();
}

function clearTravelPlan() {
    localStorage.removeItem("travelPlan");
    renderTravelPlan();
    updateTravelPlanPreview();
}

function createAccount() {
    const usernameInput = document.getElementById("newUsername");
    const passwordInput = document.getElementById("newPassword");
    const message = document.getElementById("createMessage");

    if (!usernameInput || !passwordInput || !message) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "" || password === "") {
        message.textContent = "Please fill in all fields.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username already exists
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        message.textContent = "Username already exists.";
        return;
    }

    // Add new user
    const newUser = {
        username: username,
        password: password,
        role: "user"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    message.textContent = "Account created successfully! Redirecting...";

    // Redirect after short delay
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

function goToEdit() {
    window.location.href = "edit.html";
}

function renderAdminUsers() {
    const usersList = document.getElementById("adminUsersList");
    if (!usersList) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="admin-empty-message">
                <p>No users found.</p>
            </div>
        `;
        return;
    }

    usersList.innerHTML = "";

    users.forEach((user, index) => {
        const userItem = document.createElement("div");
        userItem.className = "admin-list-item";

        userItem.innerHTML = `
            <div>
                <p><strong>${user.username}</strong></p>
                <p>Role: ${user.role}</p>
            </div>
            <button onclick="removeUser(${index})">Remove</button>
        `;

        usersList.appendChild(userItem);
    });
}

function removeUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser && users[index] && users[index].username === currentUser.username) {
        alert("You cannot remove the currently logged-in user.");
        return;
    }

    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderAdminUsers();
}

function initializeDefaultAdmin() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Remove any existing admin accounts
    users = users.filter(user => user.role !== "admin");

    // Add fresh default admin
    const defaultAdmin = {
        username: "admin",
        password: "admin",
        role: "admin"
    };

    users.unshift(defaultAdmin); // put admin at the top

    localStorage.setItem("users", JSON.stringify(users));

    console.log("Admin account reset and ensured.");
}

function goToAdmin() {
    window.location.href = "admin.html";
}

function addUserFromAdmin() {
    const usernameInput = document.getElementById("editUsername");
    const passwordInput = document.getElementById("editPassword");
    const roleInput = document.getElementById("editUserRole");
    const message = document.getElementById("editUserMessage");

    if (!usernameInput || !passwordInput || !roleInput || !message) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleInput.value;

    if (username === "" || password === "") {
        message.textContent = "Please fill in all user fields.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        message.textContent = "That username already exists.";
        return;
    }

    users.push({
        username: username,
        password: password,
        role: role
    });

    localStorage.setItem("users", JSON.stringify(users));

    message.textContent = "User added successfully.";

    usernameInput.value = "";
    passwordInput.value = "";
    roleInput.value = "user";
}

function addStation() {
    const nameInput = document.getElementById("stationName");
    const statusInput = document.getElementById("stationStatus");
    const locationInput = document.getElementById("stationLocation");
    const message = document.getElementById("stationMessage");

    if (!nameInput || !statusInput || !locationInput || !message) return;

    const name = nameInput.value.trim();
    const status = statusInput.value.trim();
    const location = locationInput.value.trim();

    if (name === "" || status === "" || location === "") {
        message.textContent = "Please fill in all station fields.";
        return;
    }

    let stations = JSON.parse(localStorage.getItem("stations")) || [];

    stations.push({
        name: name,
        status: status,
        location: location
    });

    localStorage.setItem("stations", JSON.stringify(stations));

    message.textContent = "Station added successfully.";

    nameInput.value = "";
    statusInput.value = "";
    locationInput.value = "";
}

function addBus() {
    const nameInput = document.getElementById("busName");
    const routeInput = document.getElementById("busRoute");
    const statusInput = document.getElementById("busStatus");
    const message = document.getElementById("busMessage");

    if (!nameInput || !routeInput || !statusInput || !message) return;

    const name = nameInput.value.trim();
    const route = routeInput.value.trim();
    const status = statusInput.value.trim();

    if (name === "" || route === "" || status === "") {
        message.textContent = "Please fill in all bus fields.";
        return;
    }

    let buses = JSON.parse(localStorage.getItem("buses")) || [];

    buses.push({
        name: name,
        route: route,
        status: status
    });

    localStorage.setItem("buses", JSON.stringify(buses));

    message.textContent = "Bus added successfully.";

    nameInput.value = "";
    routeInput.value = "";
    statusInput.value = "";
}

function renderAdminStations() {
    const stationsList = document.getElementById("adminStationsList");
    if (!stationsList) return;

    const stations = JSON.parse(localStorage.getItem("stations")) || [];

    if (stations.length === 0) {
        stationsList.innerHTML = `
            <div class="admin-empty-message">
                <p>No stations found.</p>
            </div>
        `;
        return;
    }

    stationsList.innerHTML = "";

    stations.forEach((station, index) => {
        const stationItem = document.createElement("div");
        stationItem.className = "admin-list-item";

        stationItem.innerHTML = `
            <div>
                <p><strong>${station.name}</strong></p>
                <p>Status: ${station.status}</p>
                <p>Location: ${station.location}</p>
            </div>
            <button onclick="removeStation(${index})">Remove</button>
        `;

        stationsList.appendChild(stationItem);
    });
}

function removeStation(index) {
    let stations = JSON.parse(localStorage.getItem("stations")) || [];
    stations.splice(index, 1);
    localStorage.setItem("stations", JSON.stringify(stations));
    renderAdminStations();
}

function renderAdminBuses() {
    const busesList = document.getElementById("adminBusesList");
    if (!busesList) return;

    const buses = JSON.parse(localStorage.getItem("buses")) || [];

    if (buses.length === 0) {
        busesList.innerHTML = `
            <div class="admin-empty-message">
                <p>No buses found.</p>
            </div>
        `;
        return;
    }

    busesList.innerHTML = "";

    buses.forEach((bus, index) => {
        const busItem = document.createElement("div");
        busItem.className = "admin-list-item";

        busItem.innerHTML = `
            <div>
                <p><strong>${bus.name}</strong></p>
                <p>Route: ${bus.route}</p>
                <p>Status: ${bus.status}</p>
            </div>
            <button onclick="removeBus(${index})">Remove</button>
        `;

        busesList.appendChild(busItem);
    });
}

function removeBus(index) {
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    buses.splice(index, 1);
    localStorage.setItem("buses", JSON.stringify(buses));
    renderAdminBuses();
}

window.onload = function () {
    initializeDefaultAdmin();

    updateTravelPlanPreview();
    renderTravelPlan();
    renderAdminUsers();
    renderAdminStations();
    renderAdminBuses();
};