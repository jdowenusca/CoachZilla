import { firestore } from "./FirebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export default class FirestoreService {
  constructor() {
    this.isConfigured = true;
  }

  async getCollection(collectionName) {
    try {
      const collectionRef = collection(firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    } catch (error) {
      console.error(`Unable to read collection ${collectionName}`, error);
      return [];
    }
  }

  async getDocument(collectionName, documentId) {
    try {
      const documentRef = doc(firestore, collectionName, String(documentId));
      const snapshot = await getDoc(documentRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (error) {
      console.error(`Unable to read document ${documentId} from ${collectionName}`, error);
      return null;
    }
  }

  async saveDocument(collectionName, documentId, data) {
    try {
      const documentRef = doc(firestore, collectionName, String(documentId));
      await setDoc(documentRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error(`Unable to save document ${documentId} to ${collectionName}`, error);
      return false;
    }
  }

  async deleteDocument(collectionName, documentId) {
    try {
      const documentRef = doc(firestore, collectionName, String(documentId));
      await deleteDoc(documentRef);
      return true;
    } catch (error) {
      console.error(`Unable to delete document ${documentId} from ${collectionName}`, error);
      return false;
    }
  }

  async queryCollection(collectionName, field, operator, value) {
    try {
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, where(field, operator, value));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    } catch (error) {
      console.error(`Unable to query collection ${collectionName} where ${field} ${operator} ${value}`, error);
      return [];
    }
  }
}
