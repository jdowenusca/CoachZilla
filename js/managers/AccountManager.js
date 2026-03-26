import User from "../models/User.js";

export default class AccountManager {
  constructor(storageKey = "coachzilla_users") {
    this.storageKey = storageKey;
    this.users = this.loadUsers();
  }

  loadUsers() {
    const storedUsers = localStorage.getItem(this.storageKey);

    if (!storedUsers) {
      return [];
    }

    const parsedUsers = JSON.parse(storedUsers);

    return parsedUsers.map(
      (user) => new User(user.userID, user.username, user.password, user.role)
    );
  }

  saveUsers() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  generateUserID() {
    if (this.users.length === 0) {
      return 1;
    }

    const maxID = Math.max(...this.users.map((user) => Number(user.getUserID())));
    return maxID + 1;
  }

  addUser(username, password, role = "user") {
    const existingUser = this.findUserByUsername(username);

    if (existingUser) {
      return null;
    }

    const newUser = new User(this.generateUserID(), username, password, role);
    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  removeUser(userID) {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => Number(user.getUserID()) !== Number(userID));

    if (this.users.length !== initialLength) {
      this.saveUsers();
      return true;
    }

    return false;
  }

  updateUser(userID, updatedFields = {}) {
    const user = this.findUserByID(userID);

    if (!user) {
      return null;
    }

    if (updatedFields.username !== undefined) {
      user.setUsername(updatedFields.username);
    }

    if (updatedFields.password !== undefined) {
      user.setPassword(updatedFields.password);
    }

    if (updatedFields.role !== undefined) {
      user.setRole(updatedFields.role);
    }

    this.saveUsers();
    return user;
  }

  findUserByID(userID) {
    return this.users.find((user) => Number(user.getUserID()) === Number(userID)) || null;
  }

  findUserByUsername(username) {
    return (
      this.users.find(
        (user) => user.getUsername().toLowerCase() === username.toLowerCase()
      ) || null
    );
  }

  validateLogin(username, password) {
    const user = this.findUserByUsername(username);

    if (!user) {
      return null;
    }

    if (user.getPassword() === password) {
      return user;
    }

    return null;
  }

  getAllUsers() {
    return this.users;
  }

  ensureDefaultAdmin() {
    const adminExists = this.users.some(
      (user) => user.getRole().toLowerCase() === "admin"
    );

    if (!adminExists) {
      const defaultAdmin = new User(this.generateUserID(), "admin", "admin123", "admin");
      this.users.push(defaultAdmin);
      this.saveUsers();
      return defaultAdmin;
    }

    return null;
  }
}