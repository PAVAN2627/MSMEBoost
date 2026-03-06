import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { FileText, Download, TrendingUp, Package, Zap, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productionService } from "@/services/productionService";
import { analyticsService } from "@/services/analyticsService";
import { infrastructureService } from "@/services/infrastructureService";
import { innovationService } from "@/services/innovationService";
import { sustainabilityService } from "@/services/sustainabilityService";
import { motion } from "framer-motion";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [orders, analytics, machines, equipment, projects, sustainability] = await Promise.all([
        productionService.getOrders(user.uid),
        analyticsService.getAnalytics(user.uid, 'daily', 30),
        analyticsService.getMachines(user.uid),
        infrastructureService.getEquipment(user.uid),
        innovationService.getProjects(user.uid),
        sustainabilityService.getData(user.uid)
      ]);

      setReportData({
        orders: orders.orders || [],
        analytics: analytics.data || [],
        machines: machines.machines || [],
        equipment: equipment.equipment || [],
        projects: projects.projects || [],
        sustainability: sustainability.data || []
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const generateTextReport = () => {
    if (!reportData) return;

    const date = new Date().toLocaleDateString('en-IN');
    let report = `MSMEBoost Business Report\n`;
    report += `Generated: ${date}\n`;
    report += `${'='.repeat(50)}\n\n`;

    // Operations Summary
    report += `OPERATIONS SUMMARY\n`;
    report += `${'-'.repeat(50)}\n`;
    report += `Total Orders: ${reportData.orders.length}\n`;
    report += `Active Orders: ${reportData.orders.filter((o: any) => o.status !== 'completed').length}\n`;
    report += `Completed Orders: ${reportData.orders.filter((o: any) => o.status === 'completed').length}\n\n`;

    // Financial Summary
    const totalRevenue = reportData.analytics.reduce((sum: number, d: any) => sum + d.revenue, 0);
    const totalCosts = reportData.analytics.reduce((sum: number, d: any) => sum + d.costs, 0);
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0';

    report += `FINANCIAL SUMMARY\n`;
    report += `${'-'.repeat(50)}\n`;
    report += `Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\n`;
    report += `Total Costs: ₹${totalCosts.toLocaleString('en-IN')}\n`;
    report += `Net Profit: ₹${profit.toLocaleString('en-IN')}\n`;
    report += `Profit Margin: ${profitMargin}%\n\n`;

    // Infrastructure Summary
    const operationalEquipment = reportData.equipment.filter((e: any) => e.status === 'operational').length;
    const avgEfficiency = reportData.equipment.length > 0
      ? (reportData.equipment.reduce((sum: number, e: any) => sum + e.efficiency, 0) / reportData.equipment.length).toFixed(1)
      : '0';

    report += `INFRASTRUCTURE SUMMARY\n`;
    report += `${'-'.repeat(50)}\n`;
    report += `Total Equipment: ${reportData.equipment.length}\n`;
    report += `Operational: ${operationalEquipment}\n`;
    report += `Average Efficiency: ${avgEfficiency}%\n`;
    report += `Total Machines: ${reportData.machines.length}\n\n`;

    // Innovation Summary
    const activeProjects = reportData.projects.filter((p: any) => p.status === 'in-progress').length;
    const completedProjects = reportData.projects.filter((p: any) => p.status === 'completed').length;

    report += `INNOVATION SUMMARY\n`;
    report += `${'-'.repeat(50)}\n`;
    report += `Total Projects: ${reportData.projects.length}\n`;
    report += `Active Projects: ${activeProjects}\n`;
    report += `Completed Projects: ${completedProjects}\n\n`;

    // Sustainability Summary
    const totalEnergy = reportData.sustainability.reduce((sum: number, d: any) => sum + d.energyConsumption, 0);
    const totalCarbon = reportData.sustainability.reduce((sum: number, d: any) => sum + d.carbonFootprint, 0);
    const totalWaste = reportData.sustainability.reduce((sum: number, d: any) => sum + d.wasteGenerated, 0);
    const totalRecycled = reportData.sustainability.reduce((sum: number, d: any) => sum + d.wasteRecycled, 0);
    const recyclingRate = totalWaste > 0 ? ((totalRecycled / totalWaste) * 100).toFixed(1) : '0';

    report += `SUSTAINABILITY SUMMARY\n`;
    report += `${'-'.repeat(50)}\n`;
    report += `Total Energy Consumption: ${totalEnergy.toFixed(1)} kWh\n`;
    report += `Carbon Footprint: ${totalCarbon.toFixed(1)} kg CO2\n`;
    report += `Waste Generated: ${totalWaste.toFixed(1)} kg\n`;
    report += `Waste Recycled: ${totalRecycled.toFixed(1)} kg\n`;
    report += `Recycling Rate: ${recyclingRate}%\n\n`;

    report += `${'='.repeat(50)}\n`;
    report += `End of Report\n`;

    return report;
  };

  const downloadReport = () => {
    const report = generateTextReport();
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MSMEBoost_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = reportData && (
    reportData.orders.length > 0 ||
    reportData.analytics.length > 0 ||
    reportData.equipment.length > 0 ||
    reportData.projects.length > 0 ||
    reportData.sustainability.length > 0
  );

  const totalRevenue = reportData.analytics.reduce((sum: number, d: any) => sum + d.revenue, 0);
  const totalCosts = reportData.analytics.reduce((sum: number, d: any) => sum + d.costs, 0);
  const profit = totalRevenue - totalCosts;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and download business reports</p>
        </div>
        {hasData && (
          <Button onClick={downloadReport} className="gradient-primary text-primary-foreground border-0 gap-2">
            <Download className="h-4 w-4" /> Download Report
          </Button>
        )}
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10">
            <FileText className="h-8 w-8 text-info" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            No Data Available Yet
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start adding orders, analytics, equipment, and other data to generate comprehensive business reports.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-success" },
              { label: "Net Profit", value: `₹${profit.toLocaleString('en-IN')}`, icon: TrendingUp, color: profit >= 0 ? "text-success" : "text-destructive" },
              { label: "Active Orders", value: reportData.orders.filter((o: any) => o.status !== 'completed').length.toString(), icon: Package, color: "text-info" },
              { label: "Equipment", value: reportData.equipment.length.toString(), icon: Zap, color: "text-secondary" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Report Sections */}
          <div className="space-y-6">
            {/* Operations */}
            {reportData.orders.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-info" /> Operations Summary
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{reportData.orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-info">{reportData.orders.filter((o: any) => o.status !== 'completed').length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">{reportData.orders.filter((o: any) => o.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial */}
            {reportData.analytics.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" /> Financial Summary
                </h3>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Costs</p>
                    <p className="text-2xl font-bold text-foreground">₹{totalCosts.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit</p>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{profit.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margin</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Infrastructure */}
            {reportData.equipment.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-secondary" /> Infrastructure Summary
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equipment</p>
                    <p className="text-2xl font-bold text-foreground">{reportData.equipment.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operational</p>
                    <p className="text-2xl font-bold text-success">
                      {reportData.equipment.filter((e: any) => e.status === 'operational').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.equipment.length > 0
                        ? (reportData.equipment.reduce((sum: number, e: any) => sum + e.efficiency, 0) / reportData.equipment.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sustainability */}
            {reportData.sustainability.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-success" /> Sustainability Summary
                </h3>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Energy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.sustainability.reduce((sum: number, d: any) => sum + d.energyConsumption, 0).toFixed(1)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbon</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.sustainability.reduce((sum: number, d: any) => sum + d.carbonFootprint, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waste</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.sustainability.reduce((sum: number, d: any) => sum + d.wasteGenerated, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recycling Rate</p>
                    <p className="text-2xl font-bold text-success">
                      {(() => {
                        const waste = reportData.sustainability.reduce((sum: number, d: any) => sum + d.wasteGenerated, 0);
                        const recycled = reportData.sustainability.reduce((sum: number, d: any) => sum + d.wasteRecycled, 0);
                        return waste > 0 ? ((recycled / waste) * 100).toFixed(1) : '0';
                      })()}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Reports;
