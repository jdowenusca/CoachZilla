// Bus station data model extension.
import Station from "./Station.js";

export default class BusStation extends Station {
  constructor(id, name, latitude, longitude, stationType = "Bus Station") {
    super(id, name, latitude, longitude);
    this.stationType = stationType;
  }

  setStationType(stationType) {
    this.stationType = stationType;
  }

  getStationType() {
    return this.stationType;
  }

  displayInfo() {
    return `${super.displayInfo()}, Station Type: ${this.stationType}`;
  }
}