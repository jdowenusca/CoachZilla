export default class FirebaseAuthService {
  constructor() {
    this.isConfigured = false;
  }

  async signIn(username, password) {
    return { username, password, provider: "local-prototype", success: true };
  }

  async signOut() {
    return true;
  }
}
