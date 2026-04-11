import TravelPlan from "../models/TravelPlan.js";
import RoutePlanner from "./RoutePlanner.js";

export default class TravelPlanManager {
    constructor(firestoreService) {
        this.firestoreService = firestoreService;
        this.storageKey = "travelPlans";
        this.routePlanner = new RoutePlanner();
        this.travelPlans = [];
    }

    async init() {
        this.travelPlans = await this.loadPlans();
    }

    async loadPlans() {
        const rawPlans = await this.firestoreService.getCollection(this.storageKey);
        return rawPlans.map((plan) =>
            new TravelPlan(
                plan.id || plan.travelPlanId,
                plan.userId,
                plan.selectedBusId,
                plan.destinations,
                plan.route,
                plan.status || "planned",
                plan.createdAt,
                plan.updatedAt
            )
        );
    }

async savePlan(plan) {
        // Convert custom class to plain object to fix Firebase crash
        const plainPlanObject = JSON.parse(JSON.stringify(plan));
        await this.firestoreService.saveDocument(this.storageKey, plan.travelPlanId, plainPlanObject);
    }

    // --- CREATE ---

    async createTravelPlan(userId, bus, destinationIds, allStations) {
        if (!userId || !bus || !destinationIds || destinationIds.length < 2) {
            throw new Error("Invalid travel plan input");
        }

        // ADD 'await' HERE to wait for the OSRM road API to finish!
        const route = await this.routePlanner.buildRoute(bus, destinationIds, allStations);

        const newPlan = new TravelPlan(
            null,
            userId,
            bus.id,
            destinationIds,
            route
        );

        this.travelPlans.push(newPlan);
        await this.savePlan(newPlan);

        return newPlan;
    }
    // --- READ ---

    getAllPlans() {
        return this.travelPlans;
    }

    getPlansByUser(userId) {
        return this.travelPlans.filter(plan => String(plan.userId) === String(userId));
    }

    getPlanById(planId) {
        return this.travelPlans.find(plan => String(plan.travelPlanId) === String(planId)) || null;
    }

    // --- UPDATE ---

    async updatePlanStatus(planId, newStatus) {
        const plan = this.getPlanById(planId);
        if (!plan) return null;

        plan.status = newStatus;
        plan.updatedAt = new Date().toISOString();

        await this.savePlan(plan);
        return plan;
    }

    // --- DELETE ---

    async deletePlan(planId) {
        this.travelPlans = this.travelPlans.filter(
            (plan) => String(plan.travelPlanId) !== String(planId)
        );

        await this.firestoreService.deleteDocument(this.storageKey, planId);
    }

    // --- OPTIONAL: REBUILD ROUTE ---

    async rebuildRoute(planId, bus, destinationIds, allStations) {
        const plan = this.getPlanById(planId);
        if (!plan) return null;

        const newRoute = this.routePlanner.buildRoute(bus, destinationIds, allStations);

        plan.route = newRoute;
        plan.destinations = destinationIds;
        plan.updatedAt = new Date().toISOString();

        await this.savePlan(plan);
        return plan;
    }
}