import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SchemeSearch {
  id?: string;
  userId: string;
  businessType: string;
  industry: string;
  location: string;
  schemes: string; // The full AI-generated schemes text
  createdAt: Date;
}

const SCHEMES_COLLECTION = 'government_schemes';

export const schemesService = {
  // Save a schemes search
  async saveSearch(search: Omit<SchemeSearch, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, SCHEMES_COLLECTION), {
        ...search,
        createdAt: Timestamp.fromDate(search.createdAt)
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all saved searches for a user
  async getSearches(userId: string, limitCount = 20) {
    try {
      const q = query(
        collection(db, SCHEMES_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const searches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as SchemeSearch[];
      
      return { searches, error: null };
    } catch (error: any) {
      return { searches: [], error: error.message };
    }
  }
};
