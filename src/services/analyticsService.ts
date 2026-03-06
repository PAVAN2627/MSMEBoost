import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AnalyticsData {
  id?: string;
  userId: string;
  date: Date;
  revenue: number;
  production: number;
  efficiency: number;
  costs: number;
  type: 'daily' | 'weekly' | 'monthly';
}

export interface MachineData {
  id?: string;
  userId: string;
  machineName: string;
  efficiency: number;
  capacity: number;
  used: number;
  status: 'operational' | 'maintenance' | 'offline';
  lastUpdated: Date;
}

const ANALYTICS_COLLECTION = 'analytics';
const MACHINES_COLLECTION = 'machines';

export const analyticsService = {
  // Add analytics data
  async addAnalytics(data: Omit<AnalyticsData, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, ANALYTICS_COLLECTION), {
        ...data,
        date: Timestamp.fromDate(data.date)
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get analytics data
  async getAnalytics(userId: string, type: 'daily' | 'weekly' | 'monthly', limitCount = 30) {
    try {
      const q = query(
        collection(db, ANALYTICS_COLLECTION),
        where('userId', '==', userId),
        where('type', '==', type),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as AnalyticsData[];
      // Sort in memory instead of in query
      data.sort((a, b) => b.date.getTime() - a.date.getTime());
      return { data: data.reverse(), error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Add/Update machine data
  async updateMachine(machine: Omit<MachineData, 'id' | 'lastUpdated'>) {
    try {
      const docRef = await addDoc(collection(db, MACHINES_COLLECTION), {
        ...machine,
        lastUpdated: Timestamp.now()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get machine data
  async getMachines(userId: string) {
    try {
      const q = query(
        collection(db, MACHINES_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const machines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated.toDate()
      })) as MachineData[];
      return { machines, error: null };
    } catch (error: any) {
      return { machines: [], error: error.message };
    }
  }
};
