// js/app/app.js

import { AccountManager } from "../managers/AccountManager.js";
import { BusManager } from "../managers/BusManager.js";
import { StationManager } from "../managers/StationManager.js";
import { RoutePlanner } from "../managers/RoutePlanner.js";
import { TravelPlanManager } from "../managers/TravelPlanManager.js";

export const App = {
    accountManager: new AccountManager(),
    busManager: new BusManager(),
    stationManager: new StationManager(),
    routePlanner: new RoutePlanner(),
    travelPlanManager: new TravelPlanManager(),

    currentUser: null,

    init() {
        console.log("App initialized");

        // seed prototype data (optional)
        this.seedData();
    },

    seedData() {
        if (this.busManager.getAll().length === 0) {
            this.busManager.addBus("Bus A", "Diesel", 100, 5, 60);
            this.busManager.addBus("Bus B", "Electric", 120, 3, 70);
        }
    }
};