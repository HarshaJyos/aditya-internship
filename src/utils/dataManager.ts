import { db } from "@/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc} from "firebase/firestore";

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

  // ✅ SAVE USER (FIREBASE)
  async saveUser(user: Omit<AssessedUser, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.COLLECTION), {
      ...user,
      scores: {},
      dateCompleted: new Date().toISOString(),
    });
    return docRef.id;
  }

  // ✅ GET ALL USERS (FIREBASE)
  async getAllUsers(): Promise<AssessedUser[]> {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssessedUser));
  }

  // ✅ UPDATE SCORES (FIREBASE)
  async updateUserScores(userId: string, scores: Record<string, AssessmentScore>) {
    await updateDoc(doc(db, this.COLLECTION, userId), { scores });
  }

  // ✅ CLEAR ALL (FIREBASE)
  async clearAll() {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    const promises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  }
}

export const dataManager = new DataManager();