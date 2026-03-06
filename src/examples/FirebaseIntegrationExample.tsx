/**
 * Firebase Integration Examples
 * 
 * This file shows how to integrate Firebase services into your pages.
 * Copy these patterns into your actual page components.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { productionService, ProductionOrder } from '@/services/productionService';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';
import { innovationService, InnovationProject } from '@/services/innovationService';
import { infrastructureService, Equipment } from '@/services/infrastructureService';

// ============================================
// EXAMPLE 1: Authentication in Login Page
// ============================================
export function LoginExample() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, error } = await signIn(email, password);
    
    if (error) {
      setError(error);
    } else {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

// ============================================
// EXAMPLE 2: Production Page with Real-time Data
// ============================================
export function ProductionExample() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Option A: Fetch once
    const fetchOrders = async () => {
      const { orders, error } = await productionService.getOrders(user.uid);
      if (!error) {
        setOrders(orders);
      }
      setLoading(false);
    };
    fetchOrders();

    // Option B: Real-time subscription (recommended)
    const unsubscribe = productionService.subscribeToOrders(user.uid, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createNewOrder = async () => {
    if (!user) return;

    const { id, error } = await productionService.createOrder({
      orderId: `ORD-${Date.now()}`,
      customer: "New Customer",
      product: "New Product",
      quantity: 100,
      status: "pending",
      dueDate: new Date(),
      userId: user.uid
    });

    if (error) {
      console.error("Error creating order:", error);
    } else {
      console.log("Order created with ID:", id);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={createNewOrder}>Create Order</button>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderId}</td>
              <td>{order.customer}</td>
              <td>{order.product}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Analytics Page
// ============================================
export function AnalyticsExample() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      const { data, error } = await analyticsService.getAnalytics(user.uid, 'daily', 30);
      if (!error) {
        setAnalyticsData(data);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Add new analytics entry
  const addAnalyticsEntry = async () => {
    if (!user) return;

    await analyticsService.addAnalytics({
      userId: user.uid,
      date: new Date(),
      revenue: 72000,
      production: 580,
      efficiency: 78.4,
      costs: 41000,
      type: 'daily'
    });
  };

  return (
    <div>
      <button onClick={addAnalyticsEntry}>Add Analytics Entry</button>
      {/* Use analyticsData for charts */}
      <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Innovation Page
// ============================================
export function InnovationExample() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<InnovationProject[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const { projects, error } = await innovationService.getProjects(user.uid);
      if (!error) {
        setProjects(projects);
      }
    };

    fetchProjects();
  }, [user]);

  const createProject = async () => {
    if (!user) return;

    await innovationService.createProject({
      userId: user.uid,
      name: "New Innovation Project",
      status: "Planning",
      category: "Automation",
      progress: 0,
      startDate: new Date()
    });

    // Refresh projects
    const { projects } = await innovationService.getProjects(user.uid);
    setProjects(projects);
  };

  const updateProgress = async (projectId: string, newProgress: number) => {
    await innovationService.updateProject(projectId, { progress: newProgress });
    
    // Refresh projects
    const { projects } = await innovationService.getProjects(user.uid);
    setProjects(projects);
  };

  return (
    <div>
      <button onClick={createProject}>Create Project</button>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>Progress: {project.progress}%</p>
          <button onClick={() => updateProgress(project.id!, project.progress + 10)}>
            Increase Progress
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Infrastructure Page
// ============================================
export function InfrastructureExample() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchEquipment = async () => {
      const { equipment, error } = await infrastructureService.getEquipment(user.uid);
      if (!error) {
        setEquipment(equipment);
      }
    };

    fetchEquipment();
  }, [user]);

  const addEquipment = async () => {
    if (!user) return;

    await infrastructureService.addEquipment({
      userId: user.uid,
      name: "New Machine",
      age: "1 yr",
      condition: "Excellent",
      efficiency: 95,
      status: "operational"
    });

    // Refresh equipment
    const { equipment } = await infrastructureService.getEquipment(user.uid);
    setEquipment(equipment);
  };

  return (
    <div>
      <button onClick={addEquipment}>Add Equipment</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Condition</th>
            <th>Efficiency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.condition}</td>
              <td>{item.efficiency}%</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Protected Route
// ============================================
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

// Usage in App.tsx:
// <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
