import Route from "../models/Route.js";
import Leg from "../models/Leg.js";

export default class RoutePlanner {

    getStationById(id, stations) {
        return stations.find(s => s.id === id);
    }

    calculateDistance(coord1, coord2) {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const dx = lat2 - lat1;
        const dy = lon2 - lon1;

        return Math.sqrt(dx * dx + dy * dy);
    }

    calculateHeading(coord1, coord2) {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const angle = Math.atan2(lon2 - lon1, lat2 - lat1);
        return (angle * 180 / Math.PI + 360) % 360;
    }

    calculateTime(distance, speed) {
        if (!speed || speed <= 0) return 0;
        return distance / speed;
    }

    buildRoute(bus, destinationIds, allStations) {
        if (!bus || !destinationIds || destinationIds.length < 2) {
            throw new Error("Invalid route input");
        }

        const route = new Route();
        const legs = [];

        let totalDistance = 0;
        let totalTime = 0;
        const refuelStops = [];

        for (let i = 0; i < destinationIds.length - 1; i++) {
            const start = this.getStationById(destinationIds[i], allStations);
            const end = this.getStationById(destinationIds[i + 1], allStations);

            if (!start || !end) continue;

            const startCoords = [start.latitude, start.longitude];
            const endCoords = [end.latitude, end.longitude];

            const distance = this.calculateDistance(startCoords, endCoords);
            const time = this.calculateTime(distance, bus.cruiseSpeed);
            const heading = this.calculateHeading(startCoords, endCoords);

            const isRefuelStop = end.name === "GAS";

            if (isRefuelStop) {
                refuelStops.push(end.id);
            }

            const leg = new Leg(
                null,
                start.id,
                end.id,
                startCoords,
                endCoords,
                distance,
                time,
                heading,
                isRefuelStop
            );

            legs.push(leg);

            totalDistance += distance;
            totalTime += time;
        }

        route.setLegs(legs);
        route.setTotalDistance(totalDistance);
        route.setTotalTime(totalTime);
        route.setRefuelStops(refuelStops);

        return route;
    }
}