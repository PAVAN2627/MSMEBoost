import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Plus, Package, Wrench, Clock, BarChart3, Building2, Brain, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import { infrastructureService } from "@/services/infrastructureService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);

  // Form state
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [dueDate, setDueDate] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitCost, setUnitCost] = useState("");

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

  const openEditDialog = (order: ProductionOrder) => {
    setEditingOrder(order);
    setOrderId(order.orderId);
    setCustomer(order.customer);
    setProduct(order.product);
    setQuantity(order.quantity.toString());
    setStatus(order.status);
    setDueDate(new Date(order.dueDate).toISOString().split('T')[0]);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingOrder(null);
    setOrderId("");
    setCustomer("");
    setProduct("");
    setQuantity("");
    setStatus("pending");
    setDueDate("");
    setUnitPrice("");
    setUnitCost("");
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    
    const { error } = await productionService.deleteOrder(orderId);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order deleted successfully!",
      });
    }
  };

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
    
    if (editingOrder) {
      // Update existing order
      const { error } = await productionService.updateOrder(editingOrder.id!, {
        orderId,
        customer,
        product,
        quantity: parseInt(quantity),
        status,
        dueDate: new Date(dueDate),
      });

      // Also create/update analytics data if financial info provided
      if (!error && (unitPrice || unitCost)) {
        const qty = parseInt(quantity);
        const calculatedRevenue = unitPrice ? parseFloat(unitPrice) * qty : 0;
        const calculatedCost = unitCost ? parseFloat(unitCost) * qty : 0;
        
        await analyticsService.addAnalytics({
          userId: user!.uid,
          date: new Date(),
          revenue: calculatedRevenue,
          production: qty,
          efficiency: 75,
          costs: calculatedCost,
          type: 'daily'
        });
      }

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
          description: "Order updated successfully!",
        });
        setDialogOpen(false);
        resetForm();
      }
    } else {
      // Create new order
      const { id, error } = await productionService.createOrder({
        userId: user!.uid,
        orderId,
        customer,
        product,
        quantity: parseInt(quantity),
        status,
        dueDate: new Date(dueDate),
      });

      // Auto-create analytics data
      if (!error && (unitPrice || unitCost)) {
        const qty = parseInt(quantity);
        const calculatedRevenue = unitPrice ? parseFloat(unitPrice) * qty : 0;
        const calculatedCost = unitCost ? parseFloat(unitCost) * qty : 0;
        
        await analyticsService.addAnalytics({
          userId: user!.uid,
          date: new Date(),
          revenue: calculatedRevenue,
          production: qty,
          efficiency: 75,
          costs: calculatedCost,
          type: 'daily'
        });
        
        // Auto-create a default machine if none exist
        const { machines: existingMachines } = await analyticsService.getMachines(user!.uid);
        if (!existingMachines || existingMachines.length === 0) {
          await analyticsService.updateMachine({
            userId: user!.uid,
            machineName: 'Primary Resource',
            efficiency: 75,
            capacity: 100,
            used: qty,
            status: 'operational'
          });
        }
        
        // Auto-create default equipment if none exist
        const { equipment: existingEquipment } = await infrastructureService.getEquipment(user!.uid);
        if (!existingEquipment || existingEquipment.length === 0) {
          await infrastructureService.addEquipment({
            userId: user!.uid,
            name: 'Primary Equipment',
            age: 'New',
            condition: 'Good',
            efficiency: 75,
            status: 'operational'
          });
        }
      }

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
        resetForm();
      }
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
        <h1 className="font-display text-2xl font-bold text-foreground">Operations Management</h1>
        <p className="text-sm text-muted-foreground">Manage schedules, capacity, and orders/projects</p>
      </div>
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="gradient-primary text-primary-foreground border-0 gap-2">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Edit Work Order" : "Create Work Order"}</DialogTitle>
            <DialogDescription>Fill in the details for your work order or project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order/Project ID *</Label>
              <Input
                id="orderId"
                placeholder="e.g., WO-2026-001 or PRJ-001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Client/Customer *</Label>
              <Input
                id="customer"
                placeholder="e.g., ABC Corporation"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Deliverable/Product *</Label>
              <Input
                id="product"
                placeholder="e.g., Web App, Steel Parts"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  placeholder="e.g., 300"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                />
              </div>
            </div>
            {unitPrice && quantity && (
              <div className="rounded-lg bg-accent/50 p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-semibold text-foreground">₹{(parseFloat(unitPrice) * parseInt(quantity || "0")).toLocaleString()}</span>
                </div>
                {unitCost && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold text-foreground">₹{(parseFloat(unitCost) * parseInt(quantity || "0")).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-border">
                      <span className="text-muted-foreground">Profit:</span>
                      <span className="font-semibold text-success">₹{((parseFloat(unitPrice) - parseFloat(unitCost)) * parseInt(quantity || "0")).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}
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
              {saving ? (editingOrder ? "Updating..." : "Creating...") : (editingOrder ? "Update Order" : "Create Order")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Quick Stats */}
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {[
        { label: "Active Orders", value: stats.activeOrders.toString(), icon: Package, color: "text-info" },
        { label: "Resources Available", value: stats.machinesRunning, icon: Wrench, color: "text-success" },
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
          {capacityData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No machine data yet. Add machines in Analytics section.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link to="/dashboard/analytics">
            <button className="w-full flex items-start gap-3 rounded-lg border border-border p-4 hover:border-primary transition-colors text-left">
              <BarChart3 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Add Analytics Data</p>
                <p className="text-sm text-muted-foreground mt-1">Track revenue, costs, and performance metrics</p>
              </div>
            </button>
          </Link>
          <Link to="/dashboard/infrastructure">
            <button className="w-full flex items-start gap-3 rounded-lg border border-border p-4 hover:border-primary transition-colors text-left">
              <Building2 className="h-5 w-5 text-info mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Manage Equipment</p>
                <p className="text-sm text-muted-foreground mt-1">Add and track machines, tools, and resources</p>
              </div>
            </button>
          </Link>
          <Link to="/dashboard/ai-advisor">
            <button className="w-full flex items-start gap-3 rounded-lg border border-border p-4 hover:border-primary transition-colors text-left">
              <Brain className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Ask AI Advisor</p>
                <p className="text-sm text-muted-foreground mt-1">Get recommendations and insights</p>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>

    {/* Order Table */}
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Work Orders</h3>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">March 2026</span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Deliverable</TableHead>
            <TableHead>Qty/Units</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No orders yet. Click "New Order" to create your first work order.
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDialog(o)}
                      className="p-1 hover:bg-accent rounded"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(o.id!)}
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
  </DashboardLayout>
  );
};

export default Production;
