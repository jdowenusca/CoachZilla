import { App } from "../app/app.js";

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

  const backToAdminBtn = document.getElementById("backToAdminBtn");
  const goAboutBtn = document.getElementById("goAboutBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const busFormTitle = document.getElementById("busFormTitle");
  const editingBusId = document.getElementById("editingBusId");
  const busMake = document.getElementById("busMake");
  const busModelText = document.getElementById("busModelText");
  const busModelSelect = document.getElementById("busModelSelect");
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
  const newUsernameInput = document.getElementById("newUsername");
  const newPasswordInput = document.getElementById("newPassword");
  const newFirstNameInput = document.getElementById("newFirstName");
  const newLastNameInput = document.getElementById("newLastName");
  const newRoleSelect = document.getElementById("newRole");
  const saveUserBtn = document.getElementById("saveUserBtn");
  const cancelUserEditBtn = document.getElementById("cancelUserEditBtn");
  const userFormTitle = document.getElementById("userFormTitle");
  const editingUserId = document.getElementById("editingUserId");

  const editBusesList = document.getElementById("editBusesList");
  const editStationsList = document.getElementById("editStationsList");
  const editUsersList = document.getElementById("editUsersList");

  setupNavigation();
  setupForms();
  setupUserForm();
  renderBuses();
  renderStations();
  renderUsers();
  resetBusForm();
  resetStationForm();
  resetUserForm();

function setupUserForm() {
    if (!saveUserBtn) return;

    saveUserBtn.addEventListener("click", async () => {
      const username = newUsernameInput?.value.trim();
      const password = newPasswordInput?.value;
      const firstName = newFirstNameInput?.value.trim();
      const lastName = newLastNameInput?.value.trim();
      const role = newRoleSelect?.value || "user";

      const nameRegex = /^[a-zA-Z\s\-']+$/;
      const maxLength = 15;

      const existingUserId = editingUserId.value.trim();

      if (!username || !firstName || !lastName) {
        alert("Please enter username, first name, and last name.");
        return;
      }

      if (username.length > maxLength || firstName.length > maxLength || lastName.length > maxLength) {
        alert(`Username, first name, and last name must be ${maxLength} characters or less.`);
        return;
      }

      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        alert("Names can only contain letters, spaces, hyphens, and apostrophes.");
        return;
      }

      if (!existingUserId && !password) {
        alert("Please enter a password for new user.");
        return;
      }

      saveUserBtn.disabled = true;
      saveUserBtn.textContent = existingUserId ? "Updating user..." : "Creating user...";

      try {
        if (existingUserId) {
          // Update existing user
          const user = App.accountManager.findUserByID(existingUserId);
          if (!user) {
            alert("User not found.");
            return;
          }

          if (username !== user.username) {
            const existing = App.accountManager.findUserByUsername(username);
            if (existing) {
              alert("Username already taken.");
              return;
            }
          }

          const updatedUser = await App.accountManager.updateUser(existingUserId, {
            username,
            firstName,
            lastName,
            role,
            ...(password && { password }) // Only update password if provided
          });

          if (!updatedUser) {
            alert("Failed to update user.");
            return;
          }

          alert(`Updated user ${username} successfully.`);
        } else {
          const newUserProfile = await App.authService.signUp(
            username,
            password,
            role,
            firstName,
            lastName,
            false
          );

          await App.accountManager.addUserProfile(newUserProfile);

          alert(`Created user ${username} successfully.`);
        }

        alert(`Created user ${username} successfully.`);

        resetUserForm();
        renderUsers();
      } catch (error) {
        console.error("Failed to create user:", error);
        alert("Could not create user. Please check the username and try again.");
      } finally {
        saveUserBtn.disabled = false;
        saveUserBtn.textContent = existingUserId ? "Update User" : "Create User";
      }
    });

    if (cancelUserEditBtn) {
      cancelUserEditBtn.addEventListener("click", resetUserForm);
    }
  }

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
      logoutBtn.addEventListener("click", async () => {
        await App.authService.signOut();
        App.currentUser = null;
        window.location.href = "index.html";
      });
    }
  }

  function setupForms() {
    if (stationMode) {
      stationMode.addEventListener("change", updateStationExtraFieldLabel);
    }

    if (busMake) {
      busMake.addEventListener("change", updateBusModelField);
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
    updateBusModelField();
  }

  async function handleSaveBus() {
    const make = busMake.value.trim();
    const model = make === "Ford" || make === "Prevost"
      ? busModelSelect.value.trim()
      : busModelText.value.trim();
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

    if (fuelTankSize < 10 || fuelTankSize > 300) {
      alert("enter a fuel size (10 - 300 gallons)");
      return;
    }
    
    if (fuelBurnRate < 1 || fuelBurnRate > 50) {
      alert("enter burn rate (1 - 50 MPG)");
      return;
    }
    
    if (cruiseSpeed < 5 || cruiseSpeed > 85) {
      alert("enter cruise speed (5 - 85 MPH)");
      return;
    }

    const existingBusId = editingBusId.value.trim();

    if (existingBusId) {
      const updatedBus = await App.busManager.updateBus(existingBusId, {
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
      await App.busManager.addBus(
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

  async function handleSaveStation() {
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
        updatedStation = await App.stationManager.updateBusStation(existingStationId, {
          name,
          latitude,
          longitude,
          stationType: extraValue
        });
      } else {
        updatedStation = await App.stationManager.updateRefuelStation(existingStationId, {
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
        await App.stationManager.addBusStation(name, latitude, longitude, extraValue);
      } else {
        await App.stationManager.addRefuelStation(name, latitude, longitude, extraValue);
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

  function renderUsers() {
    if (!editUsersList) return;

    const users = App.accountManager.getAllUsers();

    if (!users || users.length === 0) {
      editUsersList.innerHTML = "<p>No users available.</p>";
      return;
    }

    editUsersList.innerHTML = users.map((user) => `
      <div class="admin-card">
        <p><strong>ID:</strong> ${user.userID ?? "N/A"}</p>
        <p><strong>Username:</strong> ${user.username || "N/A"}</p>
        <p><strong>First Name:</strong> ${user.firstName || "N/A"}</p>
        <p><strong>Last Name:</strong> ${user.lastName || "N/A"}</p>
        <p><strong>Role:</strong> ${user.role || "N/A"}</p>
        <div class="card-action-row">
          <button class="edit-user-btn" data-user-id="${user.userID}" type="button">Edit</button>
          <button class="delete-user-btn" data-user-id="${user.userID}" type="button">Delete</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".edit-user-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const userId = button.dataset.userId;
        startUserEdit(userId);
      });
    });

    document.querySelectorAll(".delete-user-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const userId = button.dataset.userId;
        deleteUser(userId);
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
    if (bus.make === "Ford" || bus.make === "Prevost") {
      busModelSelect.hidden = false;
      busModelSelect.disabled = false;
      busModelText.hidden = true;
      busModelText.disabled = true;
      updateBusModelOptions();
      busModelSelect.value = bus.model || "";
    } else {
      busModelSelect.hidden = true;
      busModelSelect.disabled = true;
      busModelText.hidden = false;
      busModelText.disabled = false;
      busModelText.value = bus.model || "";
    }
    busType.value = bus.type || "";
    busFuelType.value = bus.make === "Prevost" ? "Diesel" : (bus.fuelType || "");
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

  async function deleteBus(busId) {
    const confirmed = confirm("Delete this bus?");
    if (!confirmed) return;

    const deleted = await App.busManager.removeBus(busId);

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

  async function deleteStation(stationId) {
    const confirmed = confirm("Delete this station?");
    if (!confirmed) return;

    const deleted = await App.stationManager.removeStation(stationId);

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
    busModelText.value = "";
    busModelSelect.value = "";
    busModelSelect.hidden = true;
    busModelSelect.disabled = true;
    busModelText.hidden = false;
    busModelText.disabled = false;
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

  function startUserEdit(userId) {
    const user = App.accountManager.findUserByID(userId);

    if (!user) {
      alert("User not found.");
      return;
    }

    editingUserId.value = user.userID;
    newUsernameInput.value = user.username || "";
    newPasswordInput.value = ""; // Don't populate password for security
    newFirstNameInput.value = user.firstName || "";
    newLastNameInput.value = user.lastName || "";
    newRoleSelect.value = user.role || "user";

    userFormTitle.textContent = `Edit User #${user.userID}`;
    saveUserBtn.textContent = "Update User";
  }

  async function deleteUser(userId) {
    const confirmed = confirm("Delete this user?");
    if (!confirmed) return;

    const deleted = await App.accountManager.removeUser(userId);

    if (!deleted) {
      alert("Failed to delete user.");
      return;
    }

    if (editingUserId.value === String(userId)) {
      resetUserForm();
    }

    renderUsers();
    alert("User deleted successfully.");
  }

  function resetUserForm() {
    editingUserId.value = "";
    newUsernameInput.value = "";
    newPasswordInput.value = "";
    newFirstNameInput.value = "";

    newLastNameInput.value = "";
    newRoleSelect.value = "user";

    userFormTitle.textContent = "Create New User";
    saveUserBtn.textContent = "Create User";
  }

  function updateBusModelField() {
    if (busMake.value === "Ford" || busMake.value === "Prevost") {
      busModelSelect.hidden = false;
      busModelSelect.disabled = false;
      busModelText.hidden = true;
      busModelText.disabled = true;
      updateBusModelOptions();
      busModelSelect.value = "";
      if (busMake.value === "Prevost") {
        busFuelType.value = "Diesel";
      } else if (busMake.value === "Ford") {
        busFuelType.value = "Gasoline";
      }
    } else {
      busModelSelect.hidden = true;
      busModelSelect.disabled = true;
      busModelText.hidden = false;
      busModelText.disabled = false;
      busModelSelect.value = "";
    }
  }

  function updateBusModelOptions() {
    const optionsByMake = {
      Ford: ["Econoline E-450", "Econoline E-350", "Transit E-350"],
      Prevost: ["H3-45", "X3-45"]
    };
    const make = busMake.value;
    const models = optionsByMake[make] || [];
    const placeholder = make === "Prevost"
      ? "Select Prevost Model"
      : "Select Model";

    busModelSelect.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
      models.map((model) => `<option value="${model}">${model}</option>`).join("");
  }

  function updateStationExtraFieldLabel() {
    if (stationMode.value === "refuel") {
      stationExtraField.placeholder = "Fuel Type";
    } else {
      stationExtraField.placeholder = "Station Type";
    }
  }
});
