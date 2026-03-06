import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProductionOrder {
  id?: string;
  orderId: string;
  customer: string;
  product: string;
  quantity: number;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  createdAt: Date;
  userId: string;
}

const COLLECTION_NAME = 'production_orders';

export const productionService = {
  // Create new order
  async createOrder(order: Omit<ProductionOrder, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...order,
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(order.dueDate)
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all orders for a user
  async getOrders(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as ProductionOrder[];
      // Sort in memory instead of in query
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { orders, error: null };
    } catch (error: any) {
      return { orders: [], error: error.message };
    }
  },

  // Real-time listener for orders
  subscribeToOrders(userId: string, callback: (orders: ProductionOrder[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as ProductionOrder[];
      // Sort in memory instead of in query
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    });
  },

  // Update order
  async updateOrder(orderId: string, updates: Partial<ProductionOrder>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(docRef, updates);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Delete order
  async deleteOrder(orderId: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, orderId));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};
