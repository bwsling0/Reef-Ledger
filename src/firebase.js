// Firebase initialization — auth + Firestore for Reef Ledger
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDZpLQxY3Jyov1KUaBgeItIPsb0dje5ls",
  authDomain: "reef-ledger.firebaseapp.com",
  projectId: "reef-ledger",
  storageBucket: "reef-ledger.firebasestorage.app",
  messagingSenderId: "309810578006",
  appId: "1:309810578006:web:5f25a4502e3132b8da71f7",
  measurementId: "G-Y9CRJ8YNHJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);