import Bus from "../models/Bus.js";

export default class BusManager {
  constructor(storageKey = "coachzilla_buses") {
    this.storageKey = storageKey;
    this.buses = this.loadBuses();
  }

  loadBuses() {
    const storedBuses = localStorage.getItem(this.storageKey);

    if (!storedBuses) {
      return [];
    }

    const parsedBuses = JSON.parse(storedBuses);

    return parsedBuses.map(
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

  saveBuses() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.buses));
  }

  generateBusID() {
    if (this.buses.length === 0) {
      return 1;
    }

    const maxID = Math.max(...this.buses.map((bus) => Number(bus.getID())));
    return maxID + 1;
  }

  addBus(make, model, type, fuelType, fuelTankSize, fuelBurnRate, cruiseSpeed) {
    const newBus = new Bus(
      this.generateBusID(),
      make,
      model,
      type,
      fuelType,
      Number(fuelTankSize),
      Number(fuelBurnRate),
      Number(cruiseSpeed)
    );

    this.buses.push(newBus);
    this.saveBuses();
    return newBus;
  }

  removeBus(busID) {
    const initialLength = this.buses.length;
    this.buses = this.buses.filter((bus) => Number(bus.getID()) !== Number(busID));

    if (this.buses.length !== initialLength) {
      this.saveBuses();
      return true;
    }

    return false;
  }

  updateBus(busID, updatedFields = {}) {
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

    this.saveBuses();
    return bus;
  }

  findBusByID(busID) {
    return this.buses.find((bus) => Number(bus.getID()) === Number(busID)) || null;
  }

  getAllBuses() {
    return this.buses;
  }
}