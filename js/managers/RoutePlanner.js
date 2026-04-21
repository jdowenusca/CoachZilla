// js/managers/RoutePlanner.js

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
    // FALLBACK: Haversine Formula (Miles)
    // Used for quick pathfinding and as a failsafe
    // if the real-world routing API is offline.
    // ============================================
    calculateDistance(coord1, coord2) {
        if (!coord1 || !coord2) return 0;

        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const R = 3958.8; // Earth radius in miles

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; 
    }

    // ============================================
    // REAL-WORLD ROUTING API (OSRM) w/ BULLETPROOF FALLBACK
    // ============================================
    async getRealRoadData(coord1, coord2) {
        if (!coord1 || !coord2) return { distanceMiles: 0, timeHours: 0 };

        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const targetUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        try {
            // 1. Force the fetch to timeout if it takes longer than 3 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); 

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            // 2. Only try to read the data if the server responded perfectly
            if (response.ok) {
                // 3. Make sure the proxy didn't send us an HTML error page
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    
                    const data = await response.json();
                    
                    if (data.code === "Ok" && data.routes.length > 0) {
                        const route = data.routes[0];
                        return { 
                            distanceMiles: route.distance * 0.000621371, 
                            timeHours: route.duration / 3600 
                        };
                    }
                }
            }
        } catch (error) {
            // Silently catch the timeout or CORS error without crashing
            console.warn("API overloaded or blocked. Using local city-traffic simulation.");
        }

        // ============================================
        // FAILSAFE: Local Realistic Traffic Simulator
        // If the API fails, we calculate the straight line,
        // add a 25% "curved roads" penalty, and assume 15 MPH city traffic.
        // ============================================
        const straightLineMiles = this.calculateDistance(coord1, coord2);
        const realisticDistance = straightLineMiles * 1.25; 
        const realisticTime = realisticDistance / 15; // 15 MPH average bus speed
        
        return { distanceMiles: realisticDistance, timeHours: realisticTime };
    }

    calculateHeading(coord1, coord2) {
        if (!coord1 || !coord2) return 0;

        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const magnitude = Math.sqrt(dLon * dLon + dLat * dLat);
        if (magnitude === 0) return 0; 

        const dotProduct = dLat;
        const alphaRad = Math.acos(dotProduct / magnitude);
        const alphaDeg = alphaRad * (180 / Math.PI);

        if (dLon < 0) {
            return 360 - alphaDeg;
        }
        return alphaDeg;
    }

    calculateTime(distance, speed) {
        const numericSpeed = Number(speed);
        if (!numericSpeed || numericSpeed <= 0) return 0;
        return distance / numericSpeed;
    }

    calculateMaxRange(bus) {
        if (!bus) return 0;

        const tankSize = Number(bus.fuelTankSize);  
        const mpg = Number(bus.fuelBurnRate);       

        if (!tankSize || !mpg || mpg <= 0) return 0;
        return tankSize * mpg; 
    }

    isRefuelStation(station) {
        return !!station && Object.prototype.hasOwnProperty.call(station, "fuelType");
    }

    isCompatibleRefuelStation(bus, station) {
        if (!bus || !station) return false;
        if (!this.isRefuelStation(station)) return false;
        if (!station.fuelType || String(station.fuelType).toLowerCase() === "any") return true;
        return String(bus.fuelType).toLowerCase() === String(station.fuelType).toLowerCase();
    }

    findBestRefuelStation(startStation, endStation, bus, allStations = []) {
        if (!startStation || !endStation || !bus) return null;

        const compatibleRefuelStations = allStations.filter((station) =>
            this.isCompatibleRefuelStation(bus, station)
        );

        if (compatibleRefuelStations.length === 0) return null;

        const startCoords = this.getCoordinates(startStation);
        const endCoords = this.getCoordinates(endStation);
        const maxRange = this.calculateMaxRange(bus);

        if (!startCoords || !endCoords || maxRange <= 0) return null;

        let bestCandidate = null;
        let bestScore = Infinity;

        compatibleRefuelStations.forEach((candidate) => {
            if (String(candidate.id) === String(startStation.id) || String(candidate.id) === String(endStation.id)) return;

            const candidateCoords = this.getCoordinates(candidate);
            if (!candidateCoords) return;

            // We use Haversine here for quick pathfinding checks to avoid spamming the API
            const distanceToCandidate = this.calculateDistance(startCoords, candidateCoords);
            const distanceCandidateToEnd = this.calculateDistance(candidateCoords, endCoords);

            const canReachCandidate = distanceToCandidate <= maxRange;
            const canReachEndAfterRefuel = distanceCandidateToEnd <= maxRange;

            if (!canReachCandidate || !canReachEndAfterRefuel) return;

            const totalDetourScore = distanceToCandidate + distanceCandidateToEnd;

            if (totalDetourScore < bestScore) {
                bestScore = totalDetourScore;
                bestCandidate = candidate;
            }
        });

        return bestCandidate;
    }

    async createLeg(startStation, endStation, isRefuelStop = false) {
        const startCoords = this.getCoordinates(startStation);
        const endCoords = this.getCoordinates(endStation);

        // Fetch real road distance AND time!
        const { distanceMiles, timeHours } = await this.getRealRoadData(startCoords, endCoords);
        const heading = this.calculateHeading(startCoords, endCoords);

        return {
            leg: new Leg(
                startStation,
                endStation,
                distanceMiles,
                timeHours, 
                heading,
                isRefuelStop
            ),
            distance: distanceMiles,
            time: timeHours
        };
    }

    finalizeLegTime(leg, bus) {
        if (!leg || !bus) return leg;
        
        // If OSRM failed entirely, fallback to the bus cruise speed math
        if (!leg.timeToDestination || leg.timeToDestination === 0) {
             leg.setTimeToDestination(
                this.calculateTime(Number(leg.distance), Number(bus.cruiseSpeed))
            );
        }
        return leg;
    }

    async buildRoute(bus, destinationIds = [], allStations = []) {
        if (!bus) throw new Error("A bus is required to build a route.");
        if (!Array.isArray(destinationIds) || destinationIds.length < 2) throw new Error("At least 2 destination stations are required.");
        if (!Array.isArray(allStations) || allStations.length === 0) throw new Error("Station list is required to build a route.");

        const maxRange = this.calculateMaxRange(bus);
        if (maxRange <= 0) throw new Error("Bus has invalid fuel tank size or fuel burn rate.");

        const resolvedStops = destinationIds.map((stationId) => {
            const station = this.getStationById(stationId, allStations);
            if (!station) throw new Error(`Station with ID ${stationId} was not found.`);
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
                throw new Error("Invalid coordinates for route leg.");
            }

            // Check the real road distance
            const { distanceMiles } = await this.getRealRoadData(startCoords, endCoords);

            if (distanceMiles <= maxRange) {
                const { leg, distance, time } = await this.createLeg(startStation, endStation, false);
                this.finalizeLegTime(leg, bus);

                legs.push(leg);
                totalDistance += distance;
                totalTime += Number(leg.timeToDestination); 
                continue;
            }

            const refuelStation = this.findBestRefuelStation(startStation, endStation, bus, allStations);

            if (!refuelStation) {
                throw new Error(`No compatible refuel station can bridge ${startStation.name} to ${endStation.name}.`);
            }

            const firstSegment = await this.createLeg(startStation, refuelStation, true);
            this.finalizeLegTime(firstSegment.leg, bus);

            const secondSegment = await this.createLeg(refuelStation, endStation, false);
            this.finalizeLegTime(secondSegment.leg, bus);

            legs.push(firstSegment.leg, secondSegment.leg);

            totalDistance += firstSegment.distance + secondSegment.distance;
            totalTime += Number(firstSegment.leg.timeToDestination) + Number(secondSegment.leg.timeToDestination);

            refuelStops.push(refuelStation.id);
        }

        route.setLegs(legs);
        route.setTotalDistance(Number(totalDistance.toFixed(2)));
        route.setTotalTime(Number(totalTime.toFixed(2)));
        route.setRefuelStops(refuelStops);

        return route;
    }
}
