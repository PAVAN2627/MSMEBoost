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

export interface InnovationProject {
  id?: string;
  userId: string;
  name: string;
  status: 'Planning' | 'In Progress' | 'R&D' | 'Completed';
  category: string;
  progress: number;
  description?: string;
  startDate: Date;
  targetDate?: Date;
  createdAt: Date;
}

const COLLECTION_NAME = 'innovation_projects';

export const innovationService = {
  // Create new project
  async createProject(project: Omit<InnovationProject, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...project,
        createdAt: Timestamp.now(),
        startDate: Timestamp.fromDate(project.startDate),
        targetDate: project.targetDate ? Timestamp.fromDate(project.targetDate) : null
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all projects
  async getProjects(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        targetDate: doc.data().targetDate?.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as InnovationProject[];
      // Sort in memory instead of in query
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { projects, error: null };
    } catch (error: any) {
      return { projects: [], error: error.message };
    }
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<InnovationProject>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const updateData: any = { ...updates };
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.targetDate) {
        updateData.targetDate = Timestamp.fromDate(updates.targetDate);
      }
      await updateDoc(docRef, updateData);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Delete project
  async deleteProject(projectId: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, projectId));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};
