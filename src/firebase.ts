// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { signInAnonymously } from "firebase/auth";

// Your Firebase config (from Console)
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

// ✅ Anonymous Auth (async - wait for it!)
let isAuthReady = false;
signInAnonymously(auth)
  .then((userCredential) => {
    console.log("✅ Anonymous auth success:", userCredential.user.uid);
    isAuthReady = true;
  })
  .catch((error) => {
    console.error("❌ Auth error:", error);
    isAuthReady = true; // Continue even if auth fails (for testing)
  });

// ✅ Export with auth check
export { app, isAuthReady };