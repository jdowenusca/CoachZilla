import TravelPlan from "../models/TravelPlan.js";
import RoutePlanner from "./RoutePlanner.js";

export default class TravelPlanManager {
    constructor() {
        this.storageKey = "travelPlans";
        this.routePlanner = new RoutePlanner();
    }

    // --- INTERNAL STORAGE HELPERS ---

    loadPlans() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    savePlans(plans) {
        localStorage.setItem(this.storageKey, JSON.stringify(plans));
    }

    // --- CREATE ---

    createTravelPlan(userId, bus, destinationIds, allStations) {
        if (!userId || !bus || !destinationIds || destinationIds.length < 2) {
            throw new Error("Invalid travel plan input");
        }

        const route = this.routePlanner.buildRoute(bus, destinationIds, allStations);

        const newPlan = new TravelPlan(
            null,
            userId,
            bus.id,
            destinationIds,
            route
        );

        const plans = this.loadPlans();
        plans.push(newPlan);

        this.savePlans(plans);

        return newPlan;
    }

    // --- READ ---

    getAllPlans() {
        return this.loadPlans();
    }

    getPlansByUser(userId) {
        return this.loadPlans().filter(plan => plan.userId === userId);
    }

    getPlanById(planId) {
        return this.loadPlans().find(plan => plan.travelPlanId === planId);
    }

    // --- UPDATE ---

    updatePlanStatus(planId, newStatus) {
        const plans = this.loadPlans();

        const plan = plans.find(p => p.travelPlanId === planId);
        if (!plan) return null;

        plan.status = newStatus;
        plan.updatedAt = new Date().toISOString();

        this.savePlans(plans);

        return plan;
    }

    // --- DELETE ---

    deletePlan(planId) {
        const plans = this.loadPlans();
        const updatedPlans = plans.filter(p => p.travelPlanId !== planId);

        this.savePlans(updatedPlans);
    }

    // --- OPTIONAL: REBUILD ROUTE ---

    rebuildRoute(planId, bus, destinationIds, allStations) {
        const plans = this.loadPlans();

        const plan = plans.find(p => p.travelPlanId === planId);
        if (!plan) return null;

        const newRoute = this.routePlanner.buildRoute(bus, destinationIds, allStations);

        plan.route = newRoute;
        plan.destinations = destinationIds;
        plan.updatedAt = new Date().toISOString();

        this.savePlans(plans);

        return plan;
    }
}