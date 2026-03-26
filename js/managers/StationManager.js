import BusStation from "../models/BusStation.js";
import RefuelStation from "../models/RefuelStation.js";

export default class StationManager {
  constructor(storageKey = "coachzilla_stations") {
    this.storageKey = storageKey;
    this.stations = this.loadStations();
  }

  loadStations() {
    const storedStations = localStorage.getItem(this.storageKey);

    if (!storedStations) {
      return [];
    }

    const parsedStations = JSON.parse(storedStations);

    return parsedStations.map((station) => {
      if (station.fuelType !== undefined) {
        return new RefuelStation(
          station.id,
          station.name,
          station.latitude,
          station.longitude,
          station.fuelType
        );
      }

      return new BusStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.stationType || "Bus Station"
      );
    });
  }

  saveStations() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.stations));
  }

  generateStationID() {
    if (this.stations.length === 0) {
      return 1;
    }

    const maxID = Math.max(...this.stations.map((station) => Number(station.getID())));
    return maxID + 1;
  }

  addBusStation(name, latitude, longitude, stationType = "Bus Station") {
    const newStation = new BusStation(
      this.generateStationID(),
      name,
      Number(latitude),
      Number(longitude),
      stationType
    );

    this.stations.push(newStation);
    this.saveStations();
    return newStation;
  }

  addRefuelStation(name, latitude, longitude, fuelType) {
    const newStation = new RefuelStation(
      this.generateStationID(),
      name,
      Number(latitude),
      Number(longitude),
      fuelType
    );

    this.stations.push(newStation);
    this.saveStations();
    return newStation;
  }

  removeStation(stationID) {
    const initialLength = this.stations.length;
    this.stations = this.stations.filter(
      (station) => Number(station.getID()) !== Number(stationID)
    );

    if (this.stations.length !== initialLength) {
      this.saveStations();
      return true;
    }

    return false;
  }

  findStationByID(stationID) {
    return (
      this.stations.find((station) => Number(station.getID()) === Number(stationID)) || null
    );
  }

  getAllStations() {
    return this.stations;
  }

  getAllBusStations() {
    return this.stations.filter((station) => station instanceof BusStation);
  }

  getAllRefuelStations() {
    return this.stations.filter((station) => station instanceof RefuelStation);
  }

  updateBusStation(stationID, updatedFields = {}) {
    const station = this.findStationByID(stationID);

    if (!station || !(station instanceof BusStation)) {
      return null;
    }

    if (updatedFields.name !== undefined) {
      station.setName(updatedFields.name);
    }

    if (updatedFields.latitude !== undefined) {
      station.setLatitude(Number(updatedFields.latitude));
    }

    if (updatedFields.longitude !== undefined) {
      station.setLongitude(Number(updatedFields.longitude));
    }

    if (updatedFields.stationType !== undefined) {
      station.setStationType(updatedFields.stationType);
    }

    this.saveStations();
    return station;
  }

  updateRefuelStation(stationID, updatedFields = {}) {
    const station = this.findStationByID(stationID);

    if (!station || !(station instanceof RefuelStation)) {
      return null;
    }

    if (updatedFields.name !== undefined) {
      station.setName(updatedFields.name);
    }

    if (updatedFields.latitude !== undefined) {
      station.setLatitude(Number(updatedFields.latitude));
    }

    if (updatedFields.longitude !== undefined) {
      station.setLongitude(Number(updatedFields.longitude));
    }

    if (updatedFields.fuelType !== undefined) {
      station.setFuelType(updatedFields.fuelType);
    }

    this.saveStations();
    return station;
  }
}