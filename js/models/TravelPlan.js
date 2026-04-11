export default class TravelPlan {
    constructor(
        travelPlanId,
        userId,
        selectedBusId,
        destinations = [],
        route = null,
        status = "planned",
        createdAt = null,
        updatedAt = null
    ) {
        this.travelPlanId = travelPlanId || `tp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        this.userId = userId;
        this.selectedBusId = selectedBusId;
        this.destinations = destinations;
        this.route = route;
        this.status = status;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    getTravelPlanId() {
        return this.travelPlanId;
    }

    getUserId() {
        return this.userId;
    }

    getSelectedBusId() {
        return this.selectedBusId;
    }

    getDestinations() {
        return this.destinations;
    }

    getRoute() {
        return this.route;
    }

    getStatus() {
        return this.status;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setUserId(userId) {
        this.userId = userId;
        this.touch();
    }

    setSelectedBusId(selectedBusId) {
        this.selectedBusId = selectedBusId;
        this.touch();
    }

    setDestinations(destinations) {
        this.destinations = destinations;
        this.touch();
    }

    setRoute(route) {
        this.route = route;
        this.touch();
    }

    setStatus(status) {
        this.status = status;
        this.touch();
    }

    touch() {
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            travelPlanId: this.travelPlanId,
            userId: this.userId,
            selectedBusId: this.selectedBusId,
            destinations: this.destinations,
            route: this.route,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}