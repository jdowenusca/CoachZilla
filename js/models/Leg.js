// Route leg representation including distance and travel time.
export default class Leg {
  constructor(
    startStation,
    endStation,
    distance,
    timeToDestination,
    heading,
    isRefuelStop = false
  ) {
    this.startStation = startStation;
    this.endStation = endStation;
    this.distance = distance;
    this.timeToDestination = timeToDestination;
    this.heading = heading;
    this.isRefuelStop = isRefuelStop;
  }

  getStartStation() {
    return this.startStation;
  }

  setStartStation(startStation) {
    this.startStation = startStation;
  }

  getEndStation() {
    return this.endStation;
  }

  setEndStation(endStation) {
    this.endStation = endStation;
  }

  getDistance() {
    return this.distance;
  }

  setDistance(distance) {
    this.distance = distance;
  }

  getTimeToDestination() {
    return this.timeToDestination;
  }

  setTimeToDestination(timeToDestination) {
    this.timeToDestination = timeToDestination;
  }

  getHeading() {
    return this.heading;
  }

  setHeading(heading) {
    this.heading = heading;
  }

  getIsRefuelStop() {
    return this.isRefuelStop;
  }

  setIsRefuelStop(isRefuelStop) {
    this.isRefuelStop = isRefuelStop;
  }

  displayInfo() {
    const startName = this.startStation?.getName
      ? this.startStation.getName()
      : "Unknown Start";

    const endName = this.endStation?.getName
      ? this.endStation.getName()
      : "Unknown End";

    return `Leg: ${startName} -> ${endName}, Distance: ${this.distance}, Time: ${this.timeToDestination}, Heading: ${this.heading}, Refuel Stop: ${this.isRefuelStop}`;
  }
}