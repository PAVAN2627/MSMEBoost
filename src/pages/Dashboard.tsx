import {
  TrendingUp,
  TrendingDown,
  Package,
  IndianRupee,
  Activity,
  Users,
  Brain,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { productionService } from "@/services/productionService";
import { analyticsService } from "@/services/analyticsService";
import { infrastructureService } from "@/services/infrastructureService";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch orders
      const ordersUnsub = productionService.subscribeToOrders(user.uid, (data) => {
        setOrders(data);
      });

      // Fetch machines
      const { machines } = await analyticsService.getMachines(user.uid);
      if (machines) setMachines(machines);

      // Fetch analytics
      const { data } = await analyticsService.getAnalytics(user.uid, 'daily', 30);
      if (data) setAnalyticsData(data);

      // Fetch equipment for infrastructure score
      const { equipment: equipmentData } = await infrastructureService.getEquipment(user.uid);
      if (equipmentData) setEquipment(equipmentData);

      setLoading(false);
      return ordersUnsub;
    };

    const unsubscribe = fetchData();
    return () => {
      unsubscribe.then(unsub => unsub && unsub());
    };
  }, [user]);

  const activeOrders = orders.filter(o => o.status !== 'completed').length;
  const totalRevenue = analyticsData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const avgEfficiency = analyticsData.length > 0 
    ? analyticsData.reduce((sum, d) => sum + (d.efficiency || 0), 0) / analyticsData.length 
    : 0;

  // Calculate infrastructure score dynamically
  const operationalCount = equipment.filter(e => e.status === 'operational').length;
  const avgEquipmentEfficiency = equipment.length > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length)
    : 0;
  const conditionScore = equipment.length > 0
    ? Math.round(equipment.reduce((sum, e) => {
        const conditionValue = { 'Excellent': 100, 'Good': 75, 'Fair': 50, 'Poor': 25 };
        return sum + (conditionValue[e.condition] || 50);
      }, 0) / equipment.length)
    : 0;
  const infrastructureScore = equipment.length > 0
    ? Math.round((avgEquipmentEfficiency * 0.4) + (conditionScore * 0.3) + ((operationalCount / equipment.length) * 100 * 0.3))
    : 0;

  const revenueData = analyticsData.length > 0 
    ? analyticsData.slice(-9).map(d => ({
        month: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
        revenue: d.revenue,
        production: d.production
      }))
    : [];

  const efficiencyData = machines.map(m => ({
    name: m.machineName,
    efficiency: m.efficiency
  }));

  const kpis = [
    { 
      label: "Monthly Revenue", 
      value: totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : totalRevenue > 0 ? `₹${totalRevenue.toLocaleString()}` : "₹0", 
      change: "+0%", 
      up: true, 
      icon: IndianRupee, 
      color: "text-success" 
    },
    { 
      label: "Active Orders", 
      value: activeOrders.toString(), 
      change: "0", 
      up: true, 
      icon: Activity, 
      color: "text-secondary" 
    },
    { 
      label: "Machines", 
      value: `${machines.filter(m => m.status === 'operational').length}/${machines.length}`, 
      change: "0", 
      up: true, 
      icon: Package, 
      color: "text-info" 
    },
    { 
      label: "Avg Efficiency", 
      value: avgEfficiency > 0 ? `${avgEfficiency.toFixed(1)}%` : "0%", 
      change: "0%", 
      up: true, 
      icon: Users, 
      color: "text-primary" 
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="ml-60 flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const hasData = orders.length > 0 || machines.length > 0 || analyticsData.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-60 flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {hasData ? "Welcome back! Here's your business overview." : "Welcome! Let's get started with your business data."}
          </p>
        </div>

        {!hasData ? (
          <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Welcome to MSMEBoost!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your dashboard is empty. Start by adding your first production order, machine data, or analytics entry to see insights here.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/dashboard/production">
                <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
                  Add Production Order
                </button>
              </Link>
              <Link to="/dashboard/infrastructure">
                <button className="border border-border bg-background px-6 py-2 rounded-lg font-medium hover:bg-accent">
                  Add Equipment
                </button>
              </Link>
              <Link to="/dashboard/innovation">
                <button className="border border-border bg-background px-6 py-2 rounded-lg font-medium hover:bg-accent">
                  Start Innovation Project
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {kpi.up ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={kpi.up ? "text-success" : "text-destructive"}>{kpi.change}</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className="col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground">Revenue Trend</h3>
                <div className="mt-4 h-64">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(230, 65%, 28%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(230, 65%, 28%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(230, 65%, 28%)" fill="url(#revGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No revenue data yet. Add analytics data to see trends.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground">Machine Efficiency</h3>
                <div className="mt-4 h-64">
                  {efficiencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={efficiencyData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} width={80} />
                        <Tooltip />
                        <Bar dataKey="efficiency" fill="hsl(38, 92%, 55%)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
                      No machine data yet. Add machines to track efficiency.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insights + Quick Scores */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-secondary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">AI Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-info/30 bg-info/5 p-4 text-sm">
                    Start adding data to get AI-powered insights and recommendations for your business.
                  </div>
                  <Link to="/dashboard/ai-advisor">
                    <button className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                      Ask AI Advisor <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-secondary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Quick Scores</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Production Efficiency", score: avgEfficiency > 0 ? Math.round(avgEfficiency) : 0, color: "bg-primary" },
                    { label: "Infrastructure Health", score: infrastructureScore, color: "bg-secondary" },
                    { label: "Innovation Score", score: 0, color: "bg-info" },
                    { label: "Sustainability Index", score: 0, color: "bg-success" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold text-foreground">{s.score}%</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className={`h-full rounded-full ${s.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
