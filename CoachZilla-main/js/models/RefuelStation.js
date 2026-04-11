import Station from "./Station.js";

export default class RefuelStation extends Station {
  constructor(id, name, latitude, longitude, fuelType) {
    super(id, name, latitude, longitude);
    this.fuelType = fuelType;
  }

  setFuelType(fuelType) {
    this.fuelType = fuelType;
  }

  getFuelType() {
    return this.fuelType;
  }

  displayInfo() {
    return `${super.displayInfo()}, Fuel Type: ${this.fuelType}`;
  }
}