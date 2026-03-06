import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Leaf, Droplets, Zap, Trash2, Plus, TrendingDown, TrendingUp, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { sustainabilityService, SustainabilityData } from "@/services/sustainabilityService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const Sustainability = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SustainabilityData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingData, setEditingData] = useState<SustainabilityData | null>(null);

  const [date, setDate] = useState("");
  const [energyConsumption, setEnergyConsumption] = useState("");
  const [waterUsage, setWaterUsage] = useState("");
  const [wasteGenerated, setWasteGenerated] = useState("");
  const [wasteRecycled, setWasteRecycled] = useState("");
  const [renewableEnergy, setRenewableEnergy] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: sustainabilityData } = await sustainabilityService.getData(user.uid);
      if (sustainabilityData) setData(sustainabilityData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const resetForm = () => {
    setEditingData(null);
    setDate("");
    setEnergyConsumption("");
    setWaterUsage("");
    setWasteGenerated("");
    setWasteRecycled("");
    setRenewableEnergy("");
  };

  const openEditDialog = (item: SustainabilityData) => {
    setEditingData(item);
    setDate(new Date(item.date).toISOString().split('T')[0]);
    setEnergyConsumption(item.energyConsumption.toString());
    setWaterUsage(item.waterUsage.toString());
    setWasteGenerated(item.wasteGenerated.toString());
    setWasteRecycled(item.wasteRecycled.toString());
    setRenewableEnergy(item.renewableEnergy.toString());
    setDialogOpen(true);
  };

  const handleDelete = async (dataId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    const { error } = await sustainabilityService.deleteData(dataId);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Entry deleted successfully!",
      });
      // Refresh data
      const { data: updatedData } = await sustainabilityService.getData(user!.uid);
      if (updatedData) setData(updatedData);
    }
  };

  const handleAddData = async () => {
    if (!date || !energyConsumption) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least date and energy consumption",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const energy = parseFloat(energyConsumption);
    const water = waterUsage ? parseFloat(waterUsage) : 0;
    const waste = wasteGenerated ? parseFloat(wasteGenerated) : 0;
    const recycled = wasteRecycled ? parseFloat(wasteRecycled) : 0;
    const renewable = renewableEnergy ? parseFloat(renewableEnergy) : 0;

    // Calculate carbon footprint (simplified: 0.5 kg CO2 per kWh)
    const carbonFootprint = energy * 0.5;

    if (editingData) {
      // Update existing data
      const { error } = await sustainabilityService.updateData(editingData.id!, {
        date: new Date(date),
        energyConsumption: energy,
        waterUsage: water,
        wasteGenerated: waste,
        wasteRecycled: recycled,
        carbonFootprint,
        renewableEnergy: renewable
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
          description: "Sustainability data updated successfully!",
        });
        setDialogOpen(false);
        resetForm();
        
        // Refresh data
        const { data: updatedData } = await sustainabilityService.getData(user!.uid);
        if (updatedData) setData(updatedData);
      }
    } else {
      // Add new data
      const { error } = await sustainabilityService.addData({
        userId: user!.uid,
        date: new Date(date),
        energyConsumption: energy,
        waterUsage: water,
        wasteGenerated: waste,
        wasteRecycled: recycled,
        carbonFootprint,
        renewableEnergy: renewable
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
          description: "Sustainability data added successfully!",
        });
        setDialogOpen(false);
        resetForm();
        
        // Refresh data
        const { data: updatedData } = await sustainabilityService.getData(user!.uid);
        if (updatedData) setData(updatedData);
      }
    }
  };

  const totalEnergy = data.reduce((sum, d) => sum + d.energyConsumption, 0);
  const totalWater = data.reduce((sum, d) => sum + d.waterUsage, 0);
  const totalWaste = data.reduce((sum, d) => sum + d.wasteGenerated, 0);
  const totalRecycled = data.reduce((sum, d) => sum + d.wasteRecycled, 0);
  const totalCarbon = data.reduce((sum, d) => sum + d.carbonFootprint, 0);
  const avgRenewable = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.renewableEnergy, 0) / data.length)
    : 0;
  const recyclingRate = totalWaste > 0 ? Math.round((totalRecycled / totalWaste) * 100) : 0;

  const energyTrend = data.slice(-7).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    energy: d.energyConsumption,
    carbon: d.carbonFootprint
  }));

  const wasteData = data.slice(-6).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    generated: d.wasteGenerated,
    recycled: d.wasteRecycled
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading sustainability data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = data.length > 0;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Sustainability & Resources</h1>
          <p className="text-sm text-muted-foreground">Track resource usage and get eco-friendly recommendations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> Add Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingData ? "Edit Sustainability Data" : "Add Sustainability Data"}</DialogTitle>
              <DialogDescription>Track your resource usage and environmental impact</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="energy">Energy Consumption (kWh) *</Label>
                <Input
                  id="energy"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g., 150.5"
                  value={energyConsumption}
                  onChange={(e) => setEnergyConsumption(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water">Water Usage (Liters)</Label>
                <Input
                  id="water"
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  value={waterUsage}
                  onChange={(e) => setWaterUsage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waste">Waste Generated (kg)</Label>
                <Input
                  id="waste"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  value={wasteGenerated}
                  onChange={(e) => setWasteGenerated(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recycled">Waste Recycled (kg)</Label>
                <Input
                  id="recycled"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g., 15.0"
                  value={wasteRecycled}
                  onChange={(e) => setWasteRecycled(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renewable">Renewable Energy (%)</Label>
                <Input
                  id="renewable"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 30"
                  value={renewableEnergy}
                  onChange={(e) => setRenewableEnergy(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary text-primary-foreground border-0"
                onClick={handleAddData}
                disabled={saving}
              >
                {saving ? (editingData ? "Updating..." : "Adding...") : (editingData ? "Update Data" : "Add Data")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <Leaf className="h-8 w-8 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Start Tracking Sustainability
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Track energy consumption, waste management, and get sustainability recommendations to reduce your environmental impact.
          </p>
          <Button 
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setDialogOpen(true)}
          >
            Add First Entry
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Energy", value: `${totalEnergy.toFixed(1)} kWh`, icon: Zap, color: "text-secondary" },
              { label: "Carbon Footprint", value: `${totalCarbon.toFixed(1)} kg CO2`, icon: Leaf, color: "text-success" },
              { label: "Recycling Rate", value: `${recyclingRate}%`, icon: Trash2, color: "text-info" },
              { label: "Renewable Energy", value: `${avgRenewable}%`, icon: TrendingUp, color: "text-primary" },
            ].map((kpi, i) => (
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
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Energy & Carbon Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="energy" stroke="hsl(38, 92%, 55%)" strokeWidth={2} name="Energy (kWh)" />
                    <Line type="monotone" dataKey="carbon" stroke="hsl(152, 60%, 42%)" strokeWidth={2} name="Carbon (kg CO2)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Waste Management</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                    <Tooltip />
                    <Bar dataKey="generated" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Generated (kg)" />
                    <Bar dataKey="recycled" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} name="Recycled (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-success" /> Sustainability Recommendations
            </h3>
            <div className="space-y-3">
              {recyclingRate < 50 && (
                <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <TrendingDown className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Improve Recycling Rate</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Your recycling rate is {recyclingRate}%. Consider implementing better waste segregation practices.
                    </p>
                  </div>
                </div>
              )}
              {avgRenewable < 30 && (
                <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-4">
                  <Zap className="h-5 w-5 text-info mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Switch to Renewable Energy</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Only {avgRenewable}% of your energy is renewable. Consider solar panels or green energy providers.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
                <TrendingUp className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Track Regularly</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Keep adding data regularly to identify trends and opportunities for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border p-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Sustainability Records</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Energy (kWh)</TableHead>
                  <TableHead>Water (L)</TableHead>
                  <TableHead>Waste (kg)</TableHead>
                  <TableHead>Recycled (kg)</TableHead>
                  <TableHead>Renewable %</TableHead>
                  <TableHead>Carbon (kg CO2)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No records yet. Click "Add Data" to create your first entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {new Date(item.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>{item.energyConsumption.toFixed(1)}</TableCell>
                      <TableCell>{item.waterUsage.toFixed(0)}</TableCell>
                      <TableCell>{item.wasteGenerated.toFixed(1)}</TableCell>
                      <TableCell>{item.wasteRecycled.toFixed(1)}</TableCell>
                      <TableCell>{item.renewableEnergy}%</TableCell>
                      <TableCell>{item.carbonFootprint.toFixed(1)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditDialog(item)}
                            className="p-1 hover:bg-accent rounded"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id!)}
                            className="p-1 hover:bg-destructive/10 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Sustainability;
