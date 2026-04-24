// Manages bus inventory and Firestore operations for CoachZilla.
import Bus from "../models/Bus.js";

export default class BusManager {
  constructor(firestoreService, storageKey = "buses") {
    this.firestoreService = firestoreService;
    this.storageKey = storageKey;
    this.buses = [];
  }

  async init() {
    this.buses = await this.loadBuses();
  }

  async loadBuses() {
    const rawBuses = await this.firestoreService.getCollection(this.storageKey);

    if (!rawBuses || rawBuses.length === 0) {
      return [];
    }

    return rawBuses.map(
      (bus) =>
        new Bus(
          bus.id,
          bus.make,
          bus.model,
          bus.type,
          bus.fuelType,
          bus.fuelTankSize,
          bus.fuelBurnRate,
          bus.cruiseSpeed
        )
    );
  }

  async saveBus(bus) {
    await this.firestoreService.saveDocument(this.storageKey, bus.id, {
      id: bus.id,
      make: bus.make,
      model: bus.model,
      type: bus.type,
      fuelType: bus.fuelType,
      fuelTankSize: bus.fuelTankSize,
      fuelBurnRate: bus.fuelBurnRate,
      cruiseSpeed: bus.cruiseSpeed,
      updatedAt: new Date().toISOString()
    });
  }

  generateBusID() {
    if (this.buses.length === 0) {
      return 1;
    }

    const maxID = Math.max(...this.buses.map((bus) => Number(bus.getID())));
    return maxID + 1;
  }

  async addBus(make, model, type, fuelType, fuelTankSize, fuelBurnRate, cruiseSpeed) {
    const newBus = new Bus(
      await this.generateBusID(),
      make,
      model,
      type,
      fuelType,
      Number(fuelTankSize),
      Number(fuelBurnRate),
      Number(cruiseSpeed)
    );

    this.buses.push(newBus);
    await this.saveBus(newBus);
    return newBus;
  }

  async removeBus(busID) {
    const initialLength = this.buses.length;
    this.buses = this.buses.filter((bus) => String(bus.getID()) !== String(busID));

    if (this.buses.length !== initialLength) {
      await this.firestoreService.deleteDocument(this.storageKey, busID);
      return true;
    }

    return false;
  }

  async updateBus(busID, updatedFields = {}) {
    const bus = this.findBusByID(busID);

    if (!bus) {
      return null;
    }

    if (updatedFields.make !== undefined) {
      bus.setMake(updatedFields.make);
    }

    if (updatedFields.model !== undefined) {
      bus.setModel(updatedFields.model);
    }

    if (updatedFields.type !== undefined) {
      bus.setType(updatedFields.type);
    }

    if (updatedFields.fuelType !== undefined) {
      bus.setFuelType(updatedFields.fuelType);
    }

    if (updatedFields.fuelTankSize !== undefined) {
      bus.setFuelTankSize(Number(updatedFields.fuelTankSize));
    }

    if (updatedFields.fuelBurnRate !== undefined) {
      bus.setFuelBurnRate(Number(updatedFields.fuelBurnRate));
    }

    if (updatedFields.cruiseSpeed !== undefined) {
      bus.setCruiseSpeed(Number(updatedFields.cruiseSpeed));
    }

    await this.saveBus(bus);
    return bus;
  }

  findBusByID(busID) {
    return this.buses.find((bus) => Number(bus.getID()) === Number(busID)) || null;
  }

  getAllBuses() {
    return this.buses;
  }
}