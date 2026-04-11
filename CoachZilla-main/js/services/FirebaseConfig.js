import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArSEe1C58SRhosnESKcKGfUAyjWvnc_lQ",
  authDomain: "coachzilla-565ed.firebaseapp.com",
  projectId: "coachzilla-565ed",
  storageBucket: "coachzilla-565ed.firebasestorage.app",
  messagingSenderId: "299534468128",
  appId: "1:299534468128:web:fc68d3e3e82849ac826845",
  measurementId: "G-7H6KEYE505"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export { firebaseApp, auth, firestore };