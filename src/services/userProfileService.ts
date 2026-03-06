import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName: string;
  industry: string;
  companySize: string;
  location: string;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
}

const USERS_COLLECTION = 'users';

export const userProfileService = {
  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
    try {
      const userRef = doc(db, USERS_COLLECTION, profile.userId);
      await setDoc(userRef, {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getProfile(userId: string) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          profile: {
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as UserProfile,
          error: null
        };
      }
      
      return { profile: null, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      // Check if document exists first
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return { error: 'No document to update. Please save your profile first.' };
      }
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};
