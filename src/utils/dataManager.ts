// src/utils/dataManager.ts
import { db, auth, isAuthReady } from "@/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface AssessmentScore {
  id: string;
  rawScore: number;
  normalizedScore: number;
  date: string;
}

export interface AssessedUser {
  id: string;
  name: string;
  rollNumber: string;
  phoneNumber: string;
  counselorName: string;
  signatureDate: string;
  scores: Record<string, AssessmentScore>;
  dateCompleted: string;
}

class DataManager {
  private COLLECTION = "assessedUsers";

  // Wait for auth before operations
  private async waitForAuth() {
    return new Promise((resolve) => {
      if (isAuthReady) return resolve(true);
      const unsubscribe = onAuthStateChanged(auth, () => {
        if (isAuthReady) {
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  // SAVE USER
  async saveUser(user: Omit<AssessedUser, 'id'>): Promise<string> {
    await this.waitForAuth();
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...user,
        scores: {},
        dateCompleted: new Date().toISOString(),
      });
      console.log("✅ Saved user:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving user:", error);
      throw error;
    }
  }

  // GET ALL USERS
  async getAllUsers(): Promise<AssessedUser[]> {
    await this.waitForAuth();
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssessedUser));
      console.log("✅ Loaded users:", users.length);
      return users;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return [];
    }
  }

  // UPDATE SCORES
  async updateUserScores(userId: string, scores: Record<string, AssessmentScore>) {
    await this.waitForAuth();
    try {
      await updateDoc(doc(db, this.COLLECTION, userId), { scores });
      console.log("✅ Updated scores for:", userId);
    } catch (error) {
      console.error("❌ Error updating scores:", error);
      throw error;
    }
  }

  // CLEAR ALL
  async clearAll() {
    await this.waitForAuth();
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      const promises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(promises);
      console.log("✅ Cleared all data");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      throw error;
    }
  }
}

export const dataManager = new DataManager();