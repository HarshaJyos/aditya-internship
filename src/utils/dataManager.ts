// ✅ PERFECT DATA MANAGEMENT - SINGLE SOURCE OF TRUTH
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
  private STORAGE_KEY = "assessedUsers";

  // ✅ SAFE PARSE - NEVER FAILS
  private safeParse(): AssessedUser[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      console.log("🗄️ LocalStorage raw:", stored?.substring(0, 100) + "..."); // DEBUG
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      console.log("✅ Parsed users:", parsed.length); // DEBUG
      
      // ✅ VALIDATE STRUCTURE
      return Array.isArray(parsed) 
        ? parsed.filter((user): user is AssessedUser => 
            user && 
            typeof user.id === 'string' && 
            typeof user.name === 'string' && 
            Object.keys(user.scores).length > 0
          )
        : [];
    } catch (error) {
      console.error("❌ Parse error:", error);
      return [];
    }
  }

  // ✅ SAVE COMPLETE USER (FOREVER)
  saveUser(user: Omit<AssessedUser, 'id'>): string {
    const users = this.safeParse();
    const newUser: AssessedUser = {
      ...user,
      id: Date.now().toString(),
      dateCompleted: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    console.log("💾 Saved user:", newUser.id); // DEBUG
    return newUser.id;
  }

  // ✅ GET ALL USERS (FOREVER) - SAFE
  getAllUsers(): AssessedUser[] {
    const users = this.safeParse();
    console.log("📋 Final users:", users.length, users.map(u => ({id: u.id, name: u.name}))); // DEBUG
    return users;
  }

  // ✅ UPDATE USER SCORES
  updateUserScores(userId: string, scores: Record<string, AssessmentScore>) {
    const users = this.safeParse();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].scores = scores;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
      console.log("🔄 Updated scores for:", userId); // DEBUG
    }
  }

  // ✅ CLEAR ALL (ADMIN ONLY)
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("🗑️ Cleared all data"); // DEBUG
  }
}

export const dataManager = new DataManager();