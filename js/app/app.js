// js/app/app.js

import AccountManager from "../managers/AccountManager.js";
import BusManager from "../managers/BusManager.js";
import StationManager from "../managers/StationManager.js";
import RoutePlanner from "../managers/RoutePlanner.js";
import TravelPlanManager from "../managers/TravelPlanManager.js";
import FirebaseAuthService from "../services/FirebaseAuthService.js";
import FirestoreService from "../services/FirestoreService.js";

export const App = {
  authService: new FirebaseAuthService(),
  firestoreService: new FirestoreService(),
  accountManager: null,
  busManager: null,
  stationManager: null,
  routePlanner: new RoutePlanner(),
  travelPlanManager: null,

  currentUser: null,
  currentTravelPlan: null,
  initialized: false,

  async init() {
    if (this.initialized) {
      return;
    }

    await this.authService.initialize();
    await this.authService.waitForAuthState();

    this.accountManager = new AccountManager(this.firestoreService);
    this.busManager = new BusManager(this.firestoreService);
    this.stationManager = new StationManager(this.firestoreService);
    this.travelPlanManager = new TravelPlanManager(this.firestoreService);

    await Promise.all([
      this.accountManager.init(),
      this.busManager.init(),
      this.stationManager.init(),
      this.travelPlanManager.init()
    ]);

    await this.ensureDefaultAdmin();
    await this.seedData();
    this.currentUser = await this.authService.getCurrentUserProfile();

    this.initialized = true;
  },

  async ensureDefaultAdmin() {
    const admins = await this.accountManager.getUsersByRole("admin");

    if (admins.length === 0) {
      try {
        await this.authService.signUp("admin", "admin123", "admin", "Coach", "Zilla");
      } catch (error) {
        console.warn("Default admin was not created:", error.message);
      }

      await this.accountManager.init();
    }
  },

  async seedData() {
    if ((await this.busManager.getAllBuses()).length === 0) {
      await this.busManager.addBus(
        "Ford",
        "E-450",
        "Coach",
        "Diesel",
        100,
        5,
        60
      );

      await this.busManager.addBus(
        "Blue Bird",
        "Vision",
        "Shuttle",
        "Gasoline",
        80,
        4,
        55
      );
    }

    const existingStations = this.stationManager.getAllStations();

    // Remove specific unwanted stations
    const stationsToRemove = ["Campus North Stop", "Campus East Refuel", "Campus West Refuel", "Campus South Stop"];
    for (const station of [...existingStations]) {
      if (stationsToRemove.includes(station.name)) {
        await this.stationManager.removeStation(station.getID());
      }
    }

    const plannedStations = [
    ];

    const plannedNames = plannedStations.map((station) => station.name);

    // Remove any existing stations that use the planned names so we only keep the current set.
    for (const station of [...existingStations]) {
      if (plannedNames.includes(station.name)) {
        await this.stationManager.removeStation(station.getID());
      }
    }

    for (const station of plannedStations) {
      if (station.fuelType) {
        await this.stationManager.addRefuelStation(
          station.name,
          station.latitude,
          station.longitude,
          station.fuelType
        );
      } else {
        await this.stationManager.addBusStation(
          station.name,
          station.latitude,
          station.longitude,
          station.type
        );
      }
    }
  }
};