export default class Bus {
  constructor(
    id,
    make,
    model,
    type,
    fuelType,
    fuelTankSize,
    fuelBurnRate,
    cruiseSpeed
  ) {
    this.id = id;
    this.make = make;
    this.model = model;
    this.type = type;
    this.fuelType = fuelType;
    this.fuelTankSize = fuelTankSize;
    this.fuelBurnRate = fuelBurnRate;
    this.cruiseSpeed = cruiseSpeed;
  }

  getID() {
    return this.id;
  }

  setID(id) {
    this.id = id;
  }

  getMake() {
    return this.make;
  }

  setMake(make) {
    this.make = make;
  }

  getModel() {
    return this.model;
  }

  setModel(model) {
    this.model = model;
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }

  getFuelType() {
    return this.fuelType;
  }

  setFuelType(fuelType) {
    this.fuelType = fuelType;
  }

  getFuelTankSize() {
    return this.fuelTankSize;
  }

  setFuelTankSize(fuelTankSize) {
    this.fuelTankSize = fuelTankSize;
  }

  getFuelBurnRate() {
    return this.fuelBurnRate;
  }

  setFuelBurnRate(fuelBurnRate) {
    this.fuelBurnRate = fuelBurnRate;
  }

  getCruiseSpeed() {
    return this.cruiseSpeed;
  }

  setCruiseSpeed(cruiseSpeed) {
    this.cruiseSpeed = cruiseSpeed;
  }

  calculateMaxRange() {
    if (this.fuelBurnRate <= 0) {
      return 0;
    }
    return this.fuelTankSize / this.fuelBurnRate;
  }

  displayInfo() {
    return `Bus ID: ${this.id}, Make: ${this.make}, Model: ${this.model}, Type: ${this.type}, Fuel Type: ${this.fuelType}`;
  }
}