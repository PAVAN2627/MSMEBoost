import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SustainabilityData {
  id?: string;
  userId: string;
  date: Date;
  energyConsumption: number; // kWh
  waterUsage: number; // Liters
  wasteGenerated: number; // kg
  wasteRecycled: number; // kg
  carbonFootprint: number; // kg CO2
  renewableEnergy: number; // percentage
  createdAt: Date;
}

const SUSTAINABILITY_COLLECTION = 'sustainability';

export const sustainabilityService = {
  async addData(data: Omit<SustainabilityData, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, SUSTAINABILITY_COLLECTION), {
        ...data,
        date: Timestamp.fromDate(data.date),
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  async getData(userId: string) {
    try {
      const q = query(
        collection(db, SUSTAINABILITY_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as SustainabilityData[];
      
      data.sort((a, b) => b.date.getTime() - a.date.getTime());
      return { data, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async deleteData(dataId: string) {
    try {
      await deleteDoc(doc(db, SUSTAINABILITY_COLLECTION, dataId));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async updateData(dataId: string, updates: Partial<SustainabilityData>) {
    try {
      const docRef = doc(db, SUSTAINABILITY_COLLECTION, dataId);
      const updatePayload: any = { ...updates };
      if (updates.date) {
        updatePayload.date = Timestamp.fromDate(updates.date);
      }
      await updateDoc(docRef, updatePayload);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};
