export default class Route {
  constructor(legs = []) {
    this.legs = legs;
    this.totalDistance = 0;
    this.totalTime = 0;
    this.updateTotals();
  }

  getLegs() {
    return this.legs;
  }

  setLegs(legs) {
    this.legs = legs;
    this.updateTotals();
  }

  addLeg(leg) {
    this.legs.push(leg);
    this.updateTotals();
  }

  removeLeg(index) {
    if (index >= 0 && index < this.legs.length) {
      this.legs.splice(index, 1);
      this.updateTotals();
    }
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  setTotalDistance(totalDistance) {
    this.totalDistance = totalDistance;
  }

  getTotalTime() {
    return this.totalTime;
  }

  setTotalTime(totalTime) {
    this.totalTime = totalTime;
  }

  updateTotals() {
    this.totalDistance = 0;
    this.totalTime = 0;

    for (const leg of this.legs) {
      this.totalDistance += Number(leg.getDistance()) || 0;
      this.totalTime += Number(leg.getTimeToDestination()) || 0;
    }
  }

  displayInfo() {
    return `Route with ${this.legs.length} leg(s), Total Distance: ${this.totalDistance}, Total Time: ${this.totalTime}`;
  }
}