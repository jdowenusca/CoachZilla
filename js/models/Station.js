export default class Station {
  constructor(id, name, latitude, longitude) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  getID() {
    return this.id;
  }

  setID(id) {
    this.id = id;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getLatitude() {
    return this.latitude;
  }

  setLatitude(latitude) {
    this.latitude = latitude;
  }

  getLongitude() {
    return this.longitude;
  }

  setLongitude(longitude) {
    this.longitude = longitude;
  }

  displayInfo() {
    return `Station ID: ${this.id}, Name: ${this.name}, Latitude: ${this.latitude}, Longitude: ${this.longitude}`;
  }
}