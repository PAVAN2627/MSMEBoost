import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Equipment {
  id?: string;
  userId: string;
  name: string;
  age: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  efficiency: number;
  status: 'operational' | 'needs-maintenance' | 'upgrade-needed';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
}

export interface InfrastructureScore {
  id?: string;
  userId: string;
  overallScore: number;
  equipmentHealth: number;
  energyEfficiency: number;
  transportAccess: number;
  date: Date;
}

const EQUIPMENT_COLLECTION = 'equipment';
const SCORES_COLLECTION = 'infrastructure_scores';

export const infrastructureService = {
  // Equipment Management
  async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, EQUIPMENT_COLLECTION), {
        ...equipment,
        createdAt: Timestamp.now(),
        lastMaintenance: equipment.lastMaintenance ? Timestamp.fromDate(equipment.lastMaintenance) : null,
        nextMaintenance: equipment.nextMaintenance ? Timestamp.fromDate(equipment.nextMaintenance) : null
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  async getEquipment(userId: string) {
    try {
      const q = query(
        collection(db, EQUIPMENT_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMaintenance: doc.data().lastMaintenance?.toDate(),
        nextMaintenance: doc.data().nextMaintenance?.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Equipment[];
      return { equipment, error: null };
    } catch (error: any) {
      return { equipment: [], error: error.message };
    }
  },

  async updateEquipment(equipmentId: string, updates: Partial<Equipment>) {
    try {
      const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
      const updateData: any = { ...updates };
      if (updates.lastMaintenance) {
        updateData.lastMaintenance = Timestamp.fromDate(updates.lastMaintenance);
      }
      if (updates.nextMaintenance) {
        updateData.nextMaintenance = Timestamp.fromDate(updates.nextMaintenance);
      }
      await updateDoc(docRef, updateData);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async deleteEquipment(equipmentId: string) {
    try {
      await deleteDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Infrastructure Scores
  async saveScore(score: Omit<InfrastructureScore, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, SCORES_COLLECTION), {
        ...score,
        date: Timestamp.fromDate(score.date)
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  async getLatestScore(userId: string) {
    try {
      const q = query(
        collection(db, SCORES_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { score: null, error: null };
      }
      const scores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as InfrastructureScore[];
      
      // Get the latest score
      const latestScore = scores.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      return { score: latestScore, error: null };
    } catch (error: any) {
      return { score: null, error: error.message };
    }
  }
};
