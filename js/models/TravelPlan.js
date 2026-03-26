export default class TravelPlan {
  constructor(
    id,
    selectedBus = null,
    route = null,
    destinations = [],
    status = "Planned",
    user = null
  ) {
    this.id = id;
    this.selectedBus = selectedBus;
    this.route = route;
    this.destinations = destinations;
    this.status = status;
    this.user = user;
  }

  getID() {
    return this.id;
  }

  setID(id) {
    this.id = id;
  }

  getSelectedBus() {
    return this.selectedBus;
  }

  setSelectedBus(selectedBus) {
    this.selectedBus = selectedBus;
  }

  getRoute() {
    return this.route;
  }

  setRoute(route) {
    this.route = route;
  }

  getDestinations() {
    return this.destinations;
  }

  setDestinations(destinations) {
    this.destinations = destinations;
  }

  addDestination(destination) {
    this.destinations.push(destination);
  }

  removeDestination(index) {
    if (index >= 0 && index < this.destinations.length) {
      this.destinations.splice(index, 1);
    }
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
  }

  getUser() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
  }

  displayInfo() {
    const busInfo = this.selectedBus?.getID
      ? `Bus ID: ${this.selectedBus.getID()}`
      : "No bus selected";

    const routeInfo = this.route?.displayInfo
      ? this.route.displayInfo()
      : "No route assigned";

    const userInfo = this.user?.getUsername
      ? `User: ${this.user.getUsername()}`
      : "No user assigned";

    return `Travel Plan ID: ${this.id}, ${busInfo}, Destinations: ${this.destinations.length}, Status: ${this.status}, ${userInfo}, ${routeInfo}`;
  }
}