import Leg from "../models/Leg.js";
import Route from "../models/Route.js";
import BusStation from "../models/BusStation.js";
import RefuelStation from "../models/RefuelStation.js";

export default class RoutePlanner {
  constructor() {}

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusMiles = 3958.8;

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMiles * c;
  }

  calculateHeading(lat1, lon1, lat2, lon2) {
    const phi1 = this.toRadians(lat1);
    const phi2 = this.toRadians(lat2);
    const lambda1 = this.toRadians(lon1);
    const lambda2 = this.toRadians(lon2);

    const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    heading = (heading + 360) % 360;

    return Math.round(heading);
  }

  calculateTravelTime(distance, cruiseSpeed) {
    if (!cruiseSpeed || cruiseSpeed <= 0) {
      return 0;
    }

    return distance / cruiseSpeed;
  }

  buildLeg(startStation, endStation, bus, isRefuelStop = false) {
    const distance = this.calculateDistance(
      startStation.getLatitude(),
      startStation.getLongitude(),
      endStation.getLatitude(),
      endStation.getLongitude()
    );

    const heading = this.calculateHeading(
      startStation.getLatitude(),
      startStation.getLongitude(),
      endStation.getLatitude(),
      endStation.getLongitude()
    );

    const timeToDestination = this.calculateTravelTime(
      distance,
      bus.getCruiseSpeed()
    );

    return new Leg(
      startStation,
      endStation,
      Number(distance.toFixed(2)),
      Number(timeToDestination.toFixed(2)),
      heading,
      isRefuelStop
    );
  }

  findNearestCompatibleRefuelStation(currentStation, refuelStations, busFuelType) {
    let nearestStation = null;
    let shortestDistance = Infinity;

    for (const station of refuelStations) {
      if (!(station instanceof RefuelStation)) {
        continue;
      }

      if (
        station.getFuelType().toLowerCase() !== busFuelType.toLowerCase()
      ) {
        continue;
      }

      const distance = this.calculateDistance(
        currentStation.getLatitude(),
        currentStation.getLongitude(),
        station.getLatitude(),
        station.getLongitude()
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStation = station;
      }
    }

    return nearestStation;
  }

  createRoute(startStation, endStation, bus, availableStations = []) {
    const route = new Route();

    const directDistance = this.calculateDistance(
      startStation.getLatitude(),
      startStation.getLongitude(),
      endStation.getLatitude(),
      endStation.getLongitude()
    );

    const maxRange = bus.calculateMaxRange();

    if (directDistance <= maxRange) {
      const directLeg = this.buildLeg(startStation, endStation, bus, false);
      route.addLeg(directLeg);
      return route;
    }

    const refuelStations = availableStations.filter(
      (station) => station instanceof RefuelStation
    );

    const nearestRefuelStation = this.findNearestCompatibleRefuelStation(
      startStation,
      refuelStations,
      bus.getFuelType()
    );

    if (!nearestRefuelStation) {
      return null;
    }

    const firstLegDistance = this.calculateDistance(
      startStation.getLatitude(),
      startStation.getLongitude(),
      nearestRefuelStation.getLatitude(),
      nearestRefuelStation.getLongitude()
    );

    const secondLegDistance = this.calculateDistance(
      nearestRefuelStation.getLatitude(),
      nearestRefuelStation.getLongitude(),
      endStation.getLatitude(),
      endStation.getLongitude()
    );

    if (firstLegDistance > maxRange || secondLegDistance > maxRange) {
      return null;
    }

    const leg1 = this.buildLeg(startStation, nearestRefuelStation, bus, true);
    const leg2 = this.buildLeg(nearestRefuelStation, endStation, bus, false);

    route.addLeg(leg1);
    route.addLeg(leg2);

    return route;
  }

  createMultiStopRoute(destinations, bus, availableStations = []) {
    if (!destinations || destinations.length < 2) {
      return null;
    }

    const finalRoute = new Route();

    for (let i = 0; i < destinations.length - 1; i++) {
      const startStation = destinations[i];
      const endStation = destinations[i + 1];

      const partialRoute = this.createRoute(
        startStation,
        endStation,
        bus,
        availableStations
      );

      if (!partialRoute) {
        return null;
      }

      for (const leg of partialRoute.getLegs()) {
        finalRoute.addLeg(leg);
      }
    }

    return finalRoute;
  }
}