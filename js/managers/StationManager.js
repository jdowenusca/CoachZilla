import BusStation from "../models/BusStation.js";
import RefuelStation from "../models/RefuelStation.js";

export default class StationManager {
  constructor(firestoreService, storageKey = "stations") {
    this.firestoreService = firestoreService;
    this.storageKey = storageKey;
    this.stations = [];
  }

  async init() {
    this.stations = await this.loadStations();
  }

  async loadStations() {
    const rawStations = await this.firestoreService.getCollection(this.storageKey);

    if (!rawStations || rawStations.length === 0) {
      return [];
    }

    return rawStations.map((station) => {
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

 async saveStation(station) {
    await this.firestoreService.saveDocument(this.storageKey, station.id, {
      id: station.id,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      stationType: station.stationType || null, // Added fallback
      fuelType: station.fuelType || null,       // Added fallback
      updatedAt: new Date().toISOString()
    });
  }

  generateStationID() {
    if (this.stations.length === 0) {
      return 1;
    }

    const maxID = Math.max(...this.stations.map((station) => Number(station.getID())));
    return maxID + 1;
  }

  async addBusStation(name, latitude, longitude, stationType = "Bus Station") {
    const newStation = new BusStation(
      this.generateStationID(),
      name,
      Number(latitude),
      Number(longitude),
      stationType
    );

    this.stations.push(newStation);
    await this.saveStation(newStation);
    return newStation;
  }

  async addRefuelStation(name, latitude, longitude, fuelType) {
    const newStation = new RefuelStation(
      this.generateStationID(),
      name,
      Number(latitude),
      Number(longitude),
      fuelType
    );

    this.stations.push(newStation);
    await this.saveStation(newStation);
    return newStation;
  }

  async removeStation(stationID) {
    const initialLength = this.stations.length;
    this.stations = this.stations.filter(
      (station) => String(station.getID()) !== String(stationID)
    );

    if (this.stations.length !== initialLength) {
      await this.firestoreService.deleteDocument(this.storageKey, stationID);
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

  async updateBusStation(stationID, updatedFields = {}) {
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

    await this.saveStation(station);
    return station;
  }

  async updateRefuelStation(stationID, updatedFields = {}) {
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

    await this.saveStation(station);
    return station;
  }
}