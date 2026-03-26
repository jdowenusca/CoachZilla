export default class FirestoreService {
  constructor() {
    this.mode = "local-prototype";
  }

  async getCollection(collectionName) {
    try {
      return JSON.parse(localStorage.getItem(collectionName)) || [];
    } catch (error) {
      console.error(`Unable to read collection ${collectionName}`, error);
      return [];
    }
  }

  async saveCollection(collectionName, documents) {
    localStorage.setItem(collectionName, JSON.stringify(documents));
    return true;
  }
}
