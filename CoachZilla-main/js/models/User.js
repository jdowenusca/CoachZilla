export default class User {
  constructor(userID, username, password, role = "user", firstName = "", lastName = "") {
    this.userID = userID;
    this.username = username;
    this.password = password;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  setUserID(userID) {
    this.userID = userID;
  }

  getUserID() {
    return this.userID;
  }

  setUsername(username) {
    this.username = username;
  }

  getUsername() {
    return this.username;
  }

  setPassword(password) {
    this.password = password;
  }

  getPassword() {
    return this.password;
  }

  setRole(role) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  setFirstName(firstName) {
    this.firstName = firstName;
  }

  getFirstName() {
    return this.firstName;
  }

  setLastName(lastName) {
    this.lastName = lastName;
  }

  getLastName() {
    return this.lastName;
  }

  displayInfo() {
    return `User ID: ${this.userID}, Username: ${this.username}, Role: ${this.role}`;
  }
}