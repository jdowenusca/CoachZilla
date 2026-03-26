// js/app/app.js

import AccountManager from "../managers/AccountManager.js";
import BusManager from "../managers/BusManager.js";
import StationManager from "../managers/StationManager.js";
import RoutePlanner from "../managers/RoutePlanner.js";
import TravelPlanManager from "../managers/TravelPlanManager.js";

export const App = {
  accountManager: new AccountManager(),
  busManager: new BusManager(),
  stationManager: new StationManager(),
  routePlanner: new RoutePlanner(),
  travelPlanManager: new TravelPlanManager(),

  currentUser: null,

  init() {
    console.log("App initialized");

    this.accountManager.ensureDefaultAdmin();
    this.seedData();
  },

  seedData() {
    if (this.busManager.getAllBuses().length === 0) {
      this.busManager.addBus(
        "Ford",
        "E-450",
        "Coach",
        "Diesel",
        100,
        5,
        60
      );

      this.busManager.addBus(
        "Blue Bird",
        "Vision",
        "Shuttle",
        "Gasoline",
        80,
        4,
        55
      );
    }

    if (this.stationManager.getAllStations().length === 0) {
      this.stationManager.addBusStation(
        "Campus Main Stop",
        33.5018,
        -81.9696,
        "Bus Station"
      );

      this.stationManager.addBusStation(
        "Downtown Transit Center",
        33.4735,
        -81.9748,
        "Bus Station"
      );

      this.stationManager.addRefuelStation(
        "Diesel Refuel Hub",
        33.485,
        -81.965,
        "Diesel"
      );

      this.stationManager.addRefuelStation(
        "Gas Refuel Depot",
        33.49,
        -81.98,
        "Gasoline"
      );
    }
  }
};