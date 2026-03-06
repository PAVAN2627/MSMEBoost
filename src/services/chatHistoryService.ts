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

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id?: string;
  userId: string;
  messages: ChatMessage[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_HISTORY_COLLECTION = 'chat_history';

export const chatHistoryService = {
  // Save a chat session
  async saveSession(session: Omit<ChatSession, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, CHAT_HISTORY_COLLECTION), {
        ...session,
        messages: session.messages.map(m => ({
          ...m,
          timestamp: Timestamp.fromDate(m.timestamp)
        })),
        createdAt: Timestamp.fromDate(session.createdAt),
        updatedAt: Timestamp.fromDate(session.updatedAt)
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all chat sessions for a user
  async getSessions(userId: string, limitCount = 10) {
    try {
      const q = query(
        collection(db, CHAT_HISTORY_COLLECTION),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        messages: doc.data().messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp.toDate()
        })),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as ChatSession[];
      
      return { sessions, error: null };
    } catch (error: any) {
      return { sessions: [], error: error.message };
    }
  }
};
