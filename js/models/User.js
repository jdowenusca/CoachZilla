export default class User {
  constructor(userID, username, password, role = "user") {
    this.userID = userID;
    this.username = username;
    this.password = password;
    this.role = role;
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

  displayInfo() {
    return `User ID: ${this.userID}, Username: ${this.username}, Role: ${this.role}`;
  }
}