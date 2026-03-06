import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Plus, AlertTriangle, CheckCircle2, Clock, Package, Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { productionService, ProductionOrder } from "@/services/productionService";
import { analyticsService, MachineData } from "@/services/analyticsService";
import { useToast } from "@/hooks/use-toast";

const bottlenecks = [
  { area: "CNC Lathe Station", issue: "Queue buildup — 4 jobs waiting", severity: "high" },
  { area: "Quality Check", issue: "Manual inspection causing 2hr delay", severity: "medium" },
  { area: "Raw Material Store", issue: "Low stock on Grade-8 Steel", severity: "high" },
];

const statusBadge = (s: string) => {
  if (s === "completed") return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
  if (s === "in-progress") return <Badge className="bg-info/10 text-info border-info/20">In Progress</Badge>;
  return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
};

const Production = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!user) return;

    // Real-time orders subscription
    const unsubscribe = productionService.subscribeToOrders(user.uid, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    // Fetch machine data
    analyticsService.getMachines(user.uid).then(({ machines }) => {
      if (machines) setMachines(machines);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateOrder = async () => {
    if (!orderId || !customer || !product || !quantity || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { id, error } = await productionService.createOrder({
      userId: user!.uid,
      orderId,
      customer,
      product,
      quantity: parseInt(quantity),
      status,
      dueDate: new Date(dueDate),
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
        description: "Order created successfully!",
      });
      setDialogOpen(false);
      // Reset form
      setOrderId("");
      setCustomer("");
      setProduct("");
      setQuantity("");
      setStatus("pending");
      setDueDate("");
    }
  };

  const capacityData = machines.map(m => ({
    machine: m.machineName,
    capacity: m.capacity,
    used: m.used
  }));

  const stats = {
    activeOrders: orders.filter(o => o.status !== 'completed').length,
    machinesRunning: `${machines.filter(m => m.status === 'operational').length}/${machines.length}`,
    dueThisWeek: orders.filter(o => {
      const dueDate = new Date(o.dueDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && o.status !== 'completed';
    }).length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading production data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Production Planning</h1>
        <p className="text-sm text-muted-foreground">Manage schedules, capacity, and orders</p>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gradient-primary text-primary-foreground border-0 gap-2">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Production Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                placeholder="e.g., ORD-2026-001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                placeholder="e.g., ABC Industries"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Input
                id="product"
                placeholder="e.g., Steel Components"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="e.g., 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="gradient-primary text-primary-foreground border-0"
              onClick={handleCreateOrder}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Quick Stats */}
    <div className="mb-6 grid gap-4 sm:grid-cols-4">
      {[
        { label: "Active Orders", value: stats.activeOrders.toString(), icon: Package, color: "text-info" },
        { label: "Machines Running", value: stats.machinesRunning, icon: Wrench, color: "text-success" },
        { label: "Workers On Shift", value: "42", icon: Users, color: "text-primary" },
        { label: "Due This Week", value: stats.dueThisWeek.toString(), icon: Clock, color: "text-secondary" },
      ].map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{s.value}</p>
        </motion.div>
      ))}
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {/* Capacity Chart */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Machine Capacity vs Usage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
              <XAxis dataKey="machine" tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="capacity" fill="hsl(220, 14%, 92%)" radius={[4, 4, 0, 0]} name="Total Capacity" />
              <Bar dataKey="used" fill="hsl(230, 65%, 28%)" radius={[4, 4, 0, 0]} name="Used" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottlenecks */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-secondary" />
          <h3 className="font-display text-lg font-semibold text-foreground">AI Bottleneck Detection</h3>
        </div>
        <div className="space-y-3">
          {bottlenecks.map((b, i) => (
            <div key={i} className={`rounded-lg border p-4 ${b.severity === "high" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
              <p className="font-medium text-sm text-foreground">{b.area}</p>
              <p className="text-sm text-muted-foreground mt-1">{b.issue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Order Table */}
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Order Tracking</h3>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">March 2026</span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No orders yet. Click "New Order" to create your first order.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.orderId}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>{o.product}</TableCell>
                <TableCell>{o.quantity}</TableCell>
                <TableCell>{statusBadge(o.status)}</TableCell>
                <TableCell>{new Date(o.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </DashboardLayout>
  );
};

export default Production;
