import TravelPlan from "../models/TravelPlan.js";
import RoutePlanner from "./RoutePlanner.js";

export default class TravelPlanManager {
  constructor(storageKey = "coachzilla_travel_plans") {
    this.storageKey = storageKey;
    this.travelPlans = this.loadTravelPlans();
    this.routePlanner = new RoutePlanner();
  }

  loadTravelPlans() {
    const storedPlans = localStorage.getItem(this.storageKey);

    if (!storedPlans) {
      return [];
    }

    try {
      return JSON.parse(storedPlans);
    } catch (error) {
      console.error("Error loading travel plans:", error);
      return [];
    }
  }

  saveTravelPlans() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.travelPlans));
  }

  generatePlanID() {
    if (this.travelPlans.length === 0) {
      return 1;
    }

    const maxID = Math.max(
      ...this.travelPlans.map((plan) => Number(plan.id || plan._id || 0))
    );

    return maxID + 1;
  }

  createTravelPlan(user, selectedBus, destinations, availableStations = []) {
    if (!destinations || destinations.length < 2) {
      return null;
    }

    const route = this.routePlanner.createMultiStopRoute(
      destinations,
      selectedBus,
      availableStations
    );

    if (!route) {
      return null;
    }

    const plan = new TravelPlan(
      this.generatePlanID(),
      selectedBus,
      route,
      destinations,
      "Planned",
      user
    );

    const plainPlanObject = {
      id: plan.getID(),
      selectedBus,
      route,
      destinations,
      status: plan.getStatus(),
      user
    };

    this.travelPlans.push(plainPlanObject);
    this.saveTravelPlans();

    return plan;
  }

  getAllTravelPlans() {
    return this.travelPlans;
  }

  findTravelPlanByID(planID) {
    return (
      this.travelPlans.find((plan) => Number(plan.id) === Number(planID)) || null
    );
  }

  updateTravelPlanStatus(planID, newStatus) {
    const plan = this.findTravelPlanByID(planID);

    if (!plan) {
      return null;
    }

    plan.status = newStatus;
    this.saveTravelPlans();
    return plan;
  }

  removeTravelPlan(planID) {
    const initialLength = this.travelPlans.length;

    this.travelPlans = this.travelPlans.filter(
      (plan) => Number(plan.id) !== Number(planID)
    );

    if (this.travelPlans.length !== initialLength) {
      this.saveTravelPlans();
      return true;
    }

    return false;
  }

  getTravelPlansByUser(userID) {
    return this.travelPlans.filter(
      (plan) => plan.user && Number(plan.user.userID) === Number(userID)
    );
  }
}