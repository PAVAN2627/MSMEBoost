import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { Link } from "react-router-dom";

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      const { data } = await analyticsService.getAnalytics(user.uid, 'daily', 30);
      if (data) setAnalyticsData(data);

      const { machines: machineData } = await analyticsService.getMachines(user.uid);
      if (machineData) setMachines(machineData);

      setLoading(false);
    };

    fetchData();
  }, [user, authLoading]);

  const dailyProduction = analyticsData.slice(-7).map(d => ({
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    units: d.production || 0
  }));

  const machineUtil = machines.map(m => ({
    name: m.machineName,
    value: m.efficiency
  }));

  const financials = analyticsData.slice(-6).map(d => ({
    month: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
    cost: d.costs || 0,
    revenue: d.revenue || 0
  }));

  const avgEfficiency = analyticsData.length > 0 
    ? (analyticsData.reduce((sum, d) => sum + (d.efficiency || 0), 0) / analyticsData.length).toFixed(1)
    : "0";

  const totalRevenue = analyticsData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalCosts = analyticsData.reduce((sum, d) => sum + (d.costs || 0), 0);
  const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalCosts) / totalRevenue) * 100).toFixed(1) : "0";

  const kpis = [
    { label: "Avg Production", value: analyticsData.length > 0 ? `${(analyticsData.reduce((sum, d) => sum + (d.production || 0), 0) / analyticsData.length).toFixed(1)} units/day` : "0 units/day", change: "0%", up: true },
    { label: "Total Revenue", value: totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString()}`, change: "0%", up: true },
    { label: "Profit Margin", value: `${profitMargin}%`, change: "0%", up: true },
    { label: "Production Efficiency", value: `${avgEfficiency}%`, change: "0%", up: true },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = analyticsData.length > 0 || machines.length > 0;

  return (
    <DashboardLayout>
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Performance Analytics</h1>
      <p className="text-sm text-muted-foreground">Data-driven insights for your business</p>
    </div>

    {!hasData ? (
      <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          No Analytics Data Yet
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Start tracking your business performance by adding analytics data. This will help you visualize trends and make data-driven decisions.
        </p>
        <Link to="/dashboard">
          <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
            Go to Dashboard
          </button>
        </Link>
      </div>
    ) : (
      <>
        {/* KPIs */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">{k.label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{k.value}</p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {k.up ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className={k.up ? "text-success" : "text-destructive"}>{k.change}</span>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {/* Daily Production */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Daily Production Output</h3>
        <div className="h-64">
          {dailyProduction.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip />
                <Bar dataKey="units" fill="hsl(230, 65%, 28%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No production data available
            </div>
          )}
        </div>
      </div>

      {/* Machine Utilization */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Machine Utilization (%)</h3>
        <div className="h-64">
          {machineUtil.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineUtil} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(38, 92%, 55%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No machine data available
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* Revenue vs Cost */}
      <div className="col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue vs Operational Cost</h3>
        <div className="h-64">
          {financials.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financials}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 42%)" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="cost" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Cost" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No financial data available
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Analytics Summary</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Data Points</p>
            <p className="text-2xl font-bold text-foreground">{analyticsData.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Machines Tracked</p>
            <p className="text-2xl font-bold text-foreground">{machines.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Efficiency</p>
            <p className="text-2xl font-bold text-foreground">{avgEfficiency}%</p>
          </div>
        </div>
      </div>
      </div>
      </>
    )}
    </DashboardLayout>
  );
};

export default Analytics;
