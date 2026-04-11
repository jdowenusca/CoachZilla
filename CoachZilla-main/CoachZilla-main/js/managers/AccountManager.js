import User from "../models/User.js";

export default class AccountManager {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
    this.users = [];
  }

  async init() {
    this.users = await this.loadUsers();
  }

  async loadUsers() {
    const rawUsers = await this.firestoreService.getCollection("users");
    return rawUsers.map(
      (user) =>
        new User(
          user.uid || user.id || user.userID,
          user.username,
          user.password || "",
          user.role || "user",
          user.firstName || "",
          user.lastName || ""
        )
    );
  }

  async addUserProfile(profile) {
    if (!profile || !profile.userID) {
      return null;
    }

    const normalizedProfile = {
      uid: profile.userID,
      userID: profile.userID,
      username: profile.username,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      role: profile.role || "user",
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: profile.updatedAt || new Date().toISOString()
    };

    await this.firestoreService.saveDocument("users", normalizedProfile.userID, normalizedProfile);

    const createdUser = new User(
      normalizedProfile.userID,
      normalizedProfile.username,
      profile.password || "",
      normalizedProfile.role,
      normalizedProfile.firstName,
      normalizedProfile.lastName
    );

    this.users = this.users.filter(
      (user) => String(user.userID) !== String(createdUser.userID)
    );
    this.users.push(createdUser);

    return createdUser;
  }

  async removeUser(userID) {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => String(user.userID) !== String(userID));

    if (this.users.length !== initialLength) {
      await this.firestoreService.deleteDocument("users", userID);
      return true;
    }

    return false;
  }

  async updateUser(userID, updatedFields = {}) {
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

    if (updatedFields.firstName !== undefined) {
      user.setFirstName(updatedFields.firstName);
    }

    if (updatedFields.lastName !== undefined) {
      user.setLastName(updatedFields.lastName);
    }

    await this.firestoreService.saveDocument("users", user.userID, {
      userID: user.userID,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      updatedAt: new Date().toISOString()
    });

    return user;
  }

  findUserByID(userID) {
    return this.users.find((user) => String(user.userID) === String(userID)) || null;
  }

  findUserByUsername(username) {
    return (
      this.users.find(
        (user) => String(user.username).toLowerCase() === String(username).toLowerCase()
      ) || null
    );
  }

getAllUsers() {
    return this.users;
  }

  // Add this new method to fix the app.js crash
  async getUsersByRole(role) {
    return this.users.filter(
      (user) => String(user.role).toLowerCase() === String(role).toLowerCase()
    );
  }
}