// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjVpOn5eQYwfyWixT3ymKvpvTraDwI6C0",
  authDomain: "psychologist-c3836.firebaseapp.com",
  projectId: "psychologist-c3836",
  storageBucket: "psychologist-c3836.firebasestorage.app",
  messagingSenderId: "239584178049",
  appId: "1:239584178049:web:0f039a1ce3e65650a44280",
  measurementId: "G-1YX95X2B4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize anonymous authentication
signInAnonymously(auth)
  .then(() => console.log("✅ Anonymous auth success"))
  .catch(error => console.error("❌ Auth error:", error));