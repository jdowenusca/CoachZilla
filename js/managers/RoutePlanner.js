// ===============================================
// ROUTEPLANNER OWNERSHIP NOTES
// JUDAH: Overall route planning logic, including 
// leg creation, refuel station selection, and 
// time estimation.
// TALON: Distance, heading, time calculations
// (map accuracy + real-world scaling)
// ===============================================

import Route from "../models/Route.js";
import Leg from "../models/Leg.js";

export default class RoutePlanner {
    getStationById(id, stations = []) {
        return stations.find((station) => String(station.id) === String(id)) || null;
    }

    getCoordinates(station) {
        if (!station) return null;

        const latitude = Number(station.latitude);
        const longitude = Number(station.longitude);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
        }

        return [latitude, longitude];
    }
    // ============================================
    // TALON TODO:
    // Current distance calculation uses simple
    // Cartesian math on lat/long values.
    //
    // Replace this with a geographic calculation 
    // (e.g., Haversine formula or map-based routing 
    // distance via Leaflet/API, whichever works best 
    // or smthn else idc lol).
    //
    // This affects:
    // - route accuracy
    // - refuel logic correctness
    // - time estimation
    // ============================================
    calculateDistance(coord1, coord2) {
        if (!coord1 || !coord2) return 0;

        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const dx = lat2 - lat1;
        const dy = lon2 - lon1;

        return Math.sqrt(dx * dx + dy * dy);
    }
    // ============================================
    // TALON TODO:
    // Heading calculation is currently basic
    // angle math. May need adjustment if we move
    // to real map-based routing or curved paths.
    // ============================================
    calculateHeading(coord1, coord2) {
        if (!coord1 || !coord2) return 0;

        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const angle = Math.atan2(lon2 - lon1, lat2 - lat1);
        return (angle * 180) / Math.PI >= 0
            ? (angle * 180) / Math.PI
            : ((angle * 180) / Math.PI) + 360;
    }
    // ============================================
    // TALON TODO:
    // Current time calculation is a simple 
    // distance/speed formula.
    //
    // Once real distance is implemented, ensure:
    // - units match (miles/km vs coordinate space)
    // - speed aligns with real-world scale
    // ============================================
    calculateTime(distance, speed) {
        const numericSpeed = Number(speed);

        if (!numericSpeed || numericSpeed <= 0) {
            return 0;
        }

        return distance / numericSpeed;
    }

    calculateMaxRange(bus) {
        if (!bus) return 0;

        const tankSize = Number(bus.fuelTankSize);
        const burnRate = Number(bus.fuelBurnRate);

        if (!tankSize || !burnRate || burnRate <= 0) {
            return 0;
        }

        return tankSize / burnRate;
    }

    isRefuelStation(station) {
        return !!station && Object.prototype.hasOwnProperty.call(station, "fuelType");
    }

    isCompatibleRefuelStation(bus, station) {
        if (!bus || !station) return false;
        if (!this.isRefuelStation(station)) return false;

        return String(bus.fuelType).toLowerCase() === String(station.fuelType).toLowerCase();
    }

    findBestRefuelStation(startStation, endStation, bus, allStations = []) {
        if (!startStation || !endStation || !bus) return null;

        const compatibleRefuelStations = allStations.filter((station) =>
            this.isCompatibleRefuelStation(bus, station)
        );

        if (compatibleRefuelStations.length === 0) {
            return null;
        }

        const startCoords = this.getCoordinates(startStation);
        const endCoords = this.getCoordinates(endStation);
        const maxRange = this.calculateMaxRange(bus);

        if (!startCoords || !endCoords || maxRange <= 0) {
            return null;
        }

        let bestCandidate = null;
        let bestScore = Infinity;

        compatibleRefuelStations.forEach((candidate) => {
            if (
                String(candidate.id) === String(startStation.id) ||
                String(candidate.id) === String(endStation.id)
            ) {
                return;
            }

            const candidateCoords = this.getCoordinates(candidate);
            if (!candidateCoords) return;

            const distanceToCandidate = this.calculateDistance(startCoords, candidateCoords);
            const distanceCandidateToEnd = this.calculateDistance(candidateCoords, endCoords);

            const canReachCandidate = distanceToCandidate <= maxRange;
            const canReachEndAfterRefuel = distanceCandidateToEnd <= maxRange;

            if (!canReachCandidate || !canReachEndAfterRefuel) {
                return;
            }

            const totalDetourScore = distanceToCandidate + distanceCandidateToEnd;

            if (totalDetourScore < bestScore) {
                bestScore = totalDetourScore;
                bestCandidate = candidate;
            }
        });

        return bestCandidate;
    }

    createLeg(startStation, endStation, isRefuelStop = false) {
        const startCoords = this.getCoordinates(startStation);
        const endCoords = this.getCoordinates(endStation);

        const distance = this.calculateDistance(startCoords, endCoords);
        const heading = this.calculateHeading(startCoords, endCoords);

        return {
            leg: new Leg(
                startStation,
                endStation,
                distance,
                0,
                heading,
                isRefuelStop
            ),
            distance
        };
    }

    finalizeLegTime(leg, bus) {
        if (!leg || !bus) return leg;

        leg.setTimeToDestination(
            this.calculateTime(Number(leg.distance), Number(bus.cruiseSpeed))
        );

        return leg;
    }

    buildRoute(bus, destinationIds = [], allStations = []) {
        if (!bus) {
            throw new Error("A bus is required to build a route.");
        }

        if (!Array.isArray(destinationIds) || destinationIds.length < 2) {
            throw new Error("At least 2 destination stations are required.");
        }

        if (!Array.isArray(allStations) || allStations.length === 0) {
            throw new Error("Station list is required to build a route.");
        }

        const maxRange = this.calculateMaxRange(bus);

        if (maxRange <= 0) {
            throw new Error("Bus has invalid fuel tank size or fuel burn rate.");
        }

        const resolvedStops = destinationIds.map((stationId) => {
            const station = this.getStationById(stationId, allStations);

            if (!station) {
                throw new Error(`Station with ID ${stationId} was not found.`);
            }

            return station;
        });

        const route = new Route();
        const legs = [];
        const refuelStops = [];

        let totalDistance = 0;
        let totalTime = 0;

        for (let i = 0; i < resolvedStops.length - 1; i++) {
            const startStation = resolvedStops[i];
            const endStation = resolvedStops[i + 1];

            const startCoords = this.getCoordinates(startStation);
            const endCoords = this.getCoordinates(endStation);

            if (!startCoords || !endCoords) {
                throw new Error(
                    `Invalid coordinates for route leg: ${startStation?.name || "Unknown"} -> ${endStation?.name || "Unknown"}`
                );
            }

            const directDistance = this.calculateDistance(startCoords, endCoords);

            if (directDistance <= maxRange) {
                const { leg, distance } = this.createLeg(startStation, endStation, false);
                this.finalizeLegTime(leg, bus);

                legs.push(leg);
                totalDistance += distance;
                totalTime += Number(leg.timeToDestination);
                continue;
            }

            const refuelStation = this.findBestRefuelStation(
                startStation,
                endStation,
                bus,
                allStations
            );

            if (!refuelStation) {
                throw new Error(
                    `No compatible refuel station can bridge ${startStation.name} to ${endStation.name} for bus fuel type ${bus.fuelType}.`
                );
            }

            const firstSegment = this.createLeg(startStation, refuelStation, true);
            this.finalizeLegTime(firstSegment.leg, bus);

            const secondSegment = this.createLeg(refuelStation, endStation, false);
            this.finalizeLegTime(secondSegment.leg, bus);

            legs.push(firstSegment.leg, secondSegment.leg);

            totalDistance += firstSegment.distance + secondSegment.distance;
            totalTime += Number(firstSegment.leg.timeToDestination) + Number(secondSegment.leg.timeToDestination);

            refuelStops.push(refuelStation.id);
        }

        route.setLegs(legs);
        route.setTotalDistance(Number(totalDistance.toFixed(4)));
        route.setTotalTime(Number(totalTime.toFixed(4)));
        route.setRefuelStops(refuelStops);

        return route;
    }
}