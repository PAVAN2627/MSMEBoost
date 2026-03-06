import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Building2, Wrench, Zap, Truck, AlertTriangle, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { infrastructureService } from "@/services/infrastructureService";
import { Link } from "react-router-dom";

const statusBadge = (s: string) => {
  if (s === "operational") return <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>;
  if (s === "needs-maintenance") return <Badge className="bg-warning/10 text-warning border-warning/20">Maintenance</Badge>;
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Upgrade Needed</Badge>;
};

const Infrastructure = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { equipment: equipmentData } = await infrastructureService.getEquipment(user.uid);
      if (equipmentData) setEquipment(equipmentData);

      const { score: scoreData } = await infrastructureService.getLatestScore(user.uid);
      if (scoreData) setScore(scoreData);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const infraScore = score ? [{ name: "Score", value: score.overallScore, fill: "hsl(38, 92%, 55%)" }] : [{ name: "Score", value: 0, fill: "hsl(220, 14%, 92%)" }];

  const operationalCount = equipment.filter(e => e.status === 'operational').length;
  const avgEfficiency = equipment.length > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading infrastructure data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = equipment.length > 0 || score;

  return (
    <DashboardLayout>
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Infrastructure Assessment</h1>
      <p className="text-sm text-muted-foreground">Evaluate and optimize your business infrastructure</p>
    </div>

    {!hasData ? (
      <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          No Infrastructure Data Yet
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Start tracking your equipment and infrastructure to get insights and recommendations for optimization.
        </p>
        <Link to="/dashboard">
          <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
            Go to Dashboard
          </button>
        </Link>
      </div>
    ) : (
      <>
        {/* Score + Summary Cards */}
        <div className="mb-6 grid gap-6 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-2">Infrastructure Score</p>
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={infraScore} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(220, 14%, 92%)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="font-display text-3xl font-bold text-foreground -mt-2">{score?.overallScore || 0}<span className="text-lg text-muted-foreground">/100</span></p>
          </div>
          {[
            { icon: Wrench, label: "Equipment Health", value: `${avgEfficiency}%`, color: "text-info" },
            { icon: Zap, label: "Operational", value: `${operationalCount}/${equipment.length}`, color: "text-secondary" },
            { icon: Truck, label: "Total Equipment", value: equipment.length.toString(), color: "text-success" },
          ].map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{s.value}</p>
        </motion.div>
      ))}
    </div>

    {/* Equipment List */}
    <div className="mb-6 rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Equipment Inventory
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th className="p-4 font-medium">Equipment</th>
              <th className="p-4 font-medium">Age</th>
              <th className="p-4 font-medium">Condition</th>
              <th className="p-4 font-medium">Efficiency</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr className="border-b border-border last:border-0">
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No equipment added yet
                </td>
              </tr>
            ) : (
              equipment.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-foreground">{e.name}</td>
                  <td className="p-4 text-muted-foreground">{e.age}</td>
                  <td className="p-4 text-muted-foreground">{e.condition}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${e.efficiency}%` }} />
                      </div>
                      <span className="text-sm text-foreground">{e.efficiency}%</span>
                    </div>
                  </td>
                  <td className="p-4">{statusBadge(e.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Recommendations */}
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        <ArrowUpCircle className="h-5 w-5 text-secondary" /> Infrastructure Tips
      </h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Track Your Equipment</p>
            <p className="text-sm text-muted-foreground mt-0.5">Add all your equipment to monitor efficiency and plan maintenance schedules.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Regular Assessments</p>
            <p className="text-sm text-muted-foreground mt-0.5">Update equipment status regularly to identify issues before they become problems.</p>
          </div>
        </div>
      </div>
    </div>
      </>
    )}
    </DashboardLayout>
  );
};

export default Infrastructure;
