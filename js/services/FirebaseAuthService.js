import { auth, firestore } from "./FirebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export default class FirebaseAuthService {
  constructor() {
    this.user = null;
    this.userProfile = null;
    this.authStateReady = false;
    this.authStatePromise = new Promise((resolve) => {
      this.resolveAuthState = resolve;
    });
  }

async initialize() {
    onAuthStateChanged(auth, async (user) => {
      try {
        this.user = user;
        if (user) {
          this.userProfile = await this.fetchUserProfile(user.uid);
        } else {
          this.userProfile = null;
        }
      } catch (error) {
        console.error("Error during authentication state change:", error);
        this.userProfile = null;
      } finally {
        // We use finally to ENSURE the promise always resolves, 
        // even if Firebase throws an error. This prevents the buttons from breaking.
        if (!this.authStateReady) {
          this.authStateReady = true;
          this.resolveAuthState();
        }
      }
    });
  }

  async fetchUserProfile(uid) {
    if (!uid) {
      return null;
    }

    try {
      const userDoc = await getDoc(doc(firestore, "users", uid));
      if (!userDoc.exists()) {
        return null;
      }
      return { userID: uid, ...userDoc.data() };
    } catch (error) {
      console.error("Firestore permission denied or network error:", error);
      // Return null instead of crashing the initialization
      return null; 
    }
  }
  async waitForAuthState() {
    await this.authStatePromise;
  }

  usernameToEmail(username) {
    const normalized = String(username).trim().toLowerCase();
    return normalized.includes("@") ? normalized : `${normalized}@coachzilla.local`;
  }

  async signIn(username, password) {
    const email = this.usernameToEmail(username);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    this.user = userCredential.user;
    this.userProfile = await this.fetchUserProfile(this.user.uid);

    if (!this.userProfile) {
      // Create profile if it doesn't exist (for manually created users)
      const profile = {
        uid: this.user.uid,
        userID: this.user.uid,
        username,
        firstName: "",
        lastName: "",
        role: username === "admin" ? "admin" : "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, "users", this.user.uid), profile);
      this.userProfile = profile;
    }

    return this.userProfile;
  }

  async signUp(username, password, role = "user", firstName = "", lastName = "", signIn = true) {
    const email = this.usernameToEmail(username);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const profile = {
      uid: userCredential.user.uid,
      userID: userCredential.user.uid,
      username,
      firstName,
      lastName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(firestore, "users", userCredential.user.uid), profile);
    
    if (signIn) {
      this.user = userCredential.user;
      this.userProfile = profile;
    } else {
      // Sign out the newly created user to keep the admin signed in
      await firebaseSignOut(auth);
    }
    
    return profile;
  }

  async signOut() {
    await firebaseSignOut(auth);
    this.user = null;
    this.userProfile = null;
    return true;
  }

  async getUserProfile(uid) {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    if (!userDoc.exists()) {
      return null;
    }

    return { userID: uid, ...userDoc.data() };
  }

  async getCurrentUserProfile() {
    if (!auth.currentUser) {
      return null;
    }

    if (this.userProfile && this.userProfile.userID === auth.currentUser.uid) {
      return this.userProfile;
    }

    this.userProfile = await this.fetchUserProfile(auth.currentUser.uid);
    return this.userProfile;
  }

  async findUserProfileByUsername(username) {
    const usersQuery = query(
      collection(firestore, "users"),
      where("username", "==", username)
    );

    const snapshot = await getDocs(usersQuery);
    if (snapshot.empty) {
      return null;
    }

    const profile = snapshot.docs[0].data();
    return { userID: snapshot.docs[0].id, ...profile };
  }
}
