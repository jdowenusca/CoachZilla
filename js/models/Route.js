export default class Route {
    constructor(
        routeId = null,
        legs = [],
        totalDistance = 0,
        totalTime = 0,
        refuelStops = [],
        createdAt = null,
        updatedAt = null
    ) {
        this.routeId = routeId || `route-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        this.legs = legs;
        this.totalDistance = totalDistance;
        this.totalTime = totalTime;
        this.refuelStops = refuelStops;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    getRouteId() {
        return this.routeId;
    }

    getLegs() {
        return this.legs;
    }

    getTotalDistance() {
        return this.totalDistance;
    }

    getTotalTime() {
        return this.totalTime;
    }

    getRefuelStops() {
        return this.refuelStops;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setLegs(legs) {
        this.legs = legs;
        this.touch();
    }

    setTotalDistance(totalDistance) {
        this.totalDistance = totalDistance;
        this.touch();
    }

    setTotalTime(totalTime) {
        this.totalTime = totalTime;
        this.touch();
    }

    setRefuelStops(refuelStops) {
        this.refuelStops = refuelStops;
        this.touch();
    }

    addLeg(leg) {
        this.legs.push(leg);
        this.touch();
    }

    addRefuelStop(refuelStop) {
        this.refuelStops.push(refuelStop);
        this.touch();
    }

    touch() {
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            routeId: this.routeId,
            legs: this.legs,
            totalDistance: this.totalDistance,
            totalTime: this.totalTime,
            refuelStops: this.refuelStops,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}