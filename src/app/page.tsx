// src/app/page.tsx (TEMP TEST - REMOVE AFTER)
"use client";
import LandingPage from "@/components/LandingPage";
import { db, auth } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Test Auth
    console.log("Current user:", auth.currentUser);
    
    // Test Firestore
    addDoc(collection(db, "test"), { test: "Hello Firebase!", date: new Date() })
      .then(() => console.log("✅ Firestore test passed!"))
      .catch(e => console.error("❌ Firestore test failed:", e));
  }, []);

  return <LandingPage />;
}