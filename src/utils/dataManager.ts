import { db, auth, isAuthReady } from "@/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
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
  selectedAssessments: string[]; // NEW - Store selected here
  scores: Record<string, AssessmentScore>;
  dateCompleted: string;
}

class DataManager {
  private COLLECTION = "assessedUsers";

  private async waitForAuth() {
    return new Promise<void>((resolve) => {
      if (isAuthReady) return resolve();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user || isAuthReady) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  async saveUser(user: Omit<AssessedUser, 'id'>): Promise<string> {
    await this.waitForAuth();
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...user,
        selectedAssessments: [],
        scores: {},
        dateCompleted: new Date().toISOString(),
      });
      console.log("💾 Saved user:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<AssessedUser[]> {
    await this.waitForAuth();
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssessedUser));
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<AssessedUser | null> {
    await this.waitForAuth();
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as AssessedUser;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      return null;
    }
  }

  async updateUserScores(userId: string, assessmentId: string, score: AssessmentScore) {
    await this.waitForAuth();
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, { [`scores.${assessmentId}`]: score });
      console.log("✅ Updated score for assessment:", assessmentId);
    } catch (error) {
      console.error("❌ Error updating scores:", error);
      throw error;
    }
  }

  async updateSelectedAssessments(userId: string, selected: string[]) {
    await this.waitForAuth();
    try {
      await updateDoc(doc(db, this.COLLECTION, userId), { selectedAssessments: selected });
      console.log("✅ Updated selected assessments");
    } catch (error) {
      console.error("❌ Error updating selected:", error);
      throw error;
    }
  }

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