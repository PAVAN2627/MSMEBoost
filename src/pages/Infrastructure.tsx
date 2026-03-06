import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Building2, Wrench, Zap, Truck, AlertTriangle, CheckCircle2, ArrowUpCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { infrastructureService } from "@/services/infrastructureService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const statusBadge = (s: string) => {
  if (s === "operational") return <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>;
  if (s === "needs-maintenance") return <Badge className="bg-warning/10 text-warning border-warning/20">Maintenance</Badge>;
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Upgrade Needed</Badge>;
};

const Infrastructure = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState<"Excellent" | "Good" | "Fair" | "Poor">("Good");
  const [efficiency, setEfficiency] = useState("");
  const [status, setStatus] = useState<"operational" | "needs-maintenance" | "upgrade-needed">("operational");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { equipment: equipmentData } = await infrastructureService.getEquipment(user.uid);
      if (equipmentData) setEquipment(equipmentData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const resetForm = () => {
    setEditingEquipment(null);
    setName("");
    setAge("");
    setCondition("Good");
    setEfficiency("");
    setStatus("operational");
  };

  const openEditDialog = (equip: any) => {
    setEditingEquipment(equip);
    setName(equip.name);
    setAge(equip.age);
    setCondition(equip.condition);
    setEfficiency(equip.efficiency.toString());
    setStatus(equip.status);
    setDialogOpen(true);
  };

  const handleDelete = async (equipmentId: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    
    const { error } = await infrastructureService.deleteEquipment(equipmentId);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Equipment deleted successfully!",
      });
      // Refresh data
      const { equipment: updatedEquipment } = await infrastructureService.getEquipment(user!.uid);
      if (updatedEquipment) setEquipment(updatedEquipment);
    }
  };

  const handleSaveEquipment = async () => {
    if (!name || !age || !efficiency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    if (editingEquipment) {
      // Update existing equipment
      const { error } = await infrastructureService.updateEquipment(editingEquipment.id, {
        name,
        age,
        condition,
        efficiency: parseInt(efficiency),
        status
      });

      setSaving(false);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Equipment updated successfully!",
        });
        setDialogOpen(false);
        resetForm();
        // Refresh data
        const { equipment: updatedEquipment } = await infrastructureService.getEquipment(user!.uid);
        if (updatedEquipment) setEquipment(updatedEquipment);
      }
    } else {
      // Add new equipment
      const { error } = await infrastructureService.addEquipment({
        userId: user!.uid,
        name,
        age,
        condition,
        efficiency: parseInt(efficiency),
        status
      });

      setSaving(false);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Equipment added successfully!",
        });
        setDialogOpen(false);
        resetForm();
        // Refresh data
        const { equipment: updatedEquipment } = await infrastructureService.getEquipment(user!.uid);
        if (updatedEquipment) setEquipment(updatedEquipment);
      }
    }
  };

  // Calculate score dynamically from equipment data
  const operationalCount = equipment.filter(e => e.status === 'operational').length;
  const avgEfficiency = equipment.length > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length)
    : 0;

  // Calculate condition score
  const conditionScore = equipment.length > 0
    ? Math.round(equipment.reduce((sum, e) => {
        const conditionValue = { 'Excellent': 100, 'Good': 75, 'Fair': 50, 'Poor': 25 };
        return sum + (conditionValue[e.condition] || 50);
      }, 0) / equipment.length)
    : 0;

  // Calculate overall infrastructure score
  const calculatedScore = equipment.length > 0
    ? Math.round((avgEfficiency * 0.4) + (conditionScore * 0.3) + ((operationalCount / equipment.length) * 100 * 0.3))
    : 0;

  const infraScore = [{ name: "Score", value: calculatedScore, fill: "hsl(38, 92%, 55%)" }];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading infrastructure data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = equipment.length > 0;

  return (
    <DashboardLayout>
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Infrastructure Assessment</h1>
        <p className="text-sm text-muted-foreground">Evaluate and optimize your business infrastructure</p>
      </div>
      {hasData && (
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
              <DialogDescription>Track your machines, tools, and resources</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., CNC Machine, Laptop, Delivery Van"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  placeholder="e.g., New, 2 years, 5 years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent (100 pts)</SelectItem>
                    <SelectItem value="Good">Good (75 pts)</SelectItem>
                    <SelectItem value="Fair">Fair (50 pts)</SelectItem>
                    <SelectItem value="Poor">Poor (25 pts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency (%) *</Label>
                <Input
                  id="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={efficiency}
                  onChange={(e) => setEfficiency(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="needs-maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="upgrade-needed">Upgrade Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-accent/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Infrastructure Score = (Efficiency × 40%) + (Condition × 30%) + (Operational % × 30%)
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary text-primary-foreground border-0"
                onClick={handleSaveEquipment}
                disabled={saving}
              >
                {saving ? (editingEquipment ? "Updating..." : "Adding...") : (editingEquipment ? "Update Equipment" : "Add Equipment")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>

    {!hasData ? (
      <>
        <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            No Infrastructure Data Yet
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start tracking your equipment and infrastructure to get insights and recommendations for optimization.
          </p>
          <Button 
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setDialogOpen(true)}
          >
            Add First Equipment
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
              <DialogDescription>Track your machines, tools, and resources</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., CNC Machine, Laptop, Delivery Van"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  placeholder="e.g., New, 2 years, 5 years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent (100 pts)</SelectItem>
                    <SelectItem value="Good">Good (75 pts)</SelectItem>
                    <SelectItem value="Fair">Fair (50 pts)</SelectItem>
                    <SelectItem value="Poor">Poor (25 pts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency (%) *</Label>
                <Input
                  id="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={efficiency}
                  onChange={(e) => setEfficiency(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="needs-maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="upgrade-needed">Upgrade Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-accent/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Infrastructure Score = (Efficiency × 40%) + (Condition × 30%) + (Operational % × 30%)
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary text-primary-foreground border-0"
                onClick={handleSaveEquipment}
                disabled={saving}
              >
                {saving ? "Adding..." : "Add Equipment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
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
            <p className="font-display text-3xl font-bold text-foreground -mt-2">{calculatedScore}<span className="text-lg text-muted-foreground">/100</span></p>
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
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr className="border-b border-border last:border-0">
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
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
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditDialog(e)}
                        className="p-1 hover:bg-accent rounded"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1 hover:bg-destructive/10 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </td>
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
