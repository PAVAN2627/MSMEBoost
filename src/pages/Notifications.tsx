import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Bell, AlertCircle, CheckCircle, Clock, TrendingUp, Zap, Package, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { productionService } from "@/services/productionService";
import { analyticsService } from "@/services/analyticsService";
import { infrastructureService } from "@/services/infrastructureService";
import { innovationService } from "@/services/innovationService";
import { sustainabilityService } from "@/services/sustainabilityService";

type NotificationType = "warning" | "success" | "info" | "alert";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  icon: any;
  color: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const generateNotifications = async () => {
      const notifs: Notification[] = [];
      const now = new Date();

      // Fetch all data
      const [orders, analytics, equipment, projects, sustainability] = await Promise.all([
        productionService.getOrders(user.uid),
        analyticsService.getAnalytics(user.uid, 'daily', 30),
        infrastructureService.getEquipment(user.uid),
        innovationService.getProjects(user.uid),
        sustainabilityService.getData(user.uid)
      ]);

      // Check overdue orders
      if (orders.orders) {
        const overdueOrders = orders.orders.filter(o => {
          const dueDate = new Date(o.dueDate);
          return dueDate < now && o.status !== 'completed';
        });

        if (overdueOrders.length > 0) {
          notifs.push({
            id: 'overdue-orders',
            type: 'alert',
            title: `${overdueOrders.length} Overdue Order${overdueOrders.length > 1 ? 's' : ''}`,
            message: `Orders: ${overdueOrders.map(o => o.orderId).join(', ')} are past their due date. Please review and update status.`,
            time: 'Now',
            icon: AlertCircle,
            color: 'text-destructive'
          });
        }

        // Check orders due this week
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const upcomingOrders = orders.orders.filter(o => {
          const dueDate = new Date(o.dueDate);
          return dueDate > now && dueDate <= weekFromNow && o.status !== 'completed';
        });

        if (upcomingOrders.length > 0) {
          notifs.push({
            id: 'upcoming-orders',
            type: 'warning',
            title: `${upcomingOrders.length} Order${upcomingOrders.length > 1 ? 's' : ''} Due This Week`,
            message: `Orders: ${upcomingOrders.map(o => o.orderId).join(', ')} need attention. Plan your resources accordingly.`,
            time: 'Today',
            icon: Clock,
            color: 'text-warning'
          });
        }

        // Check completed orders
        const recentlyCompleted = orders.orders.filter(o => {
          const completedDate = new Date(o.createdAt);
          const daysSince = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
          return o.status === 'completed' && daysSince <= 7;
        });

        if (recentlyCompleted.length > 0) {
          notifs.push({
            id: 'completed-orders',
            type: 'success',
            title: `${recentlyCompleted.length} Order${recentlyCompleted.length > 1 ? 's' : ''} Completed`,
            message: `Great work! Orders ${recentlyCompleted.map(o => o.orderId).join(', ')} have been completed successfully.`,
            time: 'This week',
            icon: CheckCircle,
            color: 'text-success'
          });
        }
      }

      // Check equipment maintenance
      if (equipment.equipment) {
        const needsMaintenance = equipment.equipment.filter(e => e.status === 'needs-maintenance');
        if (needsMaintenance.length > 0) {
          notifs.push({
            id: 'equipment-maintenance',
            type: 'warning',
            title: 'Equipment Needs Maintenance',
            message: `${needsMaintenance.map(e => e.name).join(', ')} require${needsMaintenance.length === 1 ? 's' : ''} maintenance. Schedule service to avoid downtime.`,
            time: 'Today',
            icon: Zap,
            color: 'text-warning'
          });
        }

        // Check low efficiency equipment
        const lowEfficiency = equipment.equipment.filter(e => e.efficiency < 60 && e.status === 'operational');
        if (lowEfficiency.length > 0) {
          notifs.push({
            id: 'low-efficiency',
            type: 'warning',
            title: 'Low Equipment Efficiency',
            message: `${lowEfficiency.map(e => e.name).join(', ')} operating below 60% efficiency. Consider inspection or upgrade.`,
            time: 'Today',
            icon: TrendingUp,
            color: 'text-warning'
          });
        }
      }

      // Check innovation projects
      if (projects.projects) {
        const stalled = projects.projects.filter(p => {
          const startDate = new Date(p.startDate);
          const daysSince = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          return p.status === 'in-progress' && p.progress < 50 && daysSince > 30;
        });

        if (stalled.length > 0) {
          notifs.push({
            id: 'stalled-projects',
            type: 'info',
            title: 'Projects Need Attention',
            message: `${stalled.map(p => p.name).join(', ')} showing slow progress. Review and adjust resources or timeline.`,
            time: 'This week',
            icon: Package,
            color: 'text-info'
          });
        }

        // Check near completion projects
        const nearCompletion = projects.projects.filter(p => p.status === 'in-progress' && p.progress >= 80);
        if (nearCompletion.length > 0) {
          notifs.push({
            id: 'near-completion',
            type: 'success',
            title: 'Projects Almost Complete',
            message: `${nearCompletion.map(p => p.name).join(', ')} at ${nearCompletion[0].progress}%+ completion. Final push needed!`,
            time: 'Today',
            icon: CheckCircle,
            color: 'text-success'
          });
        }
      }

      // Check sustainability metrics
      if (sustainability.data && sustainability.data.length > 0) {
        const avgRenewable = sustainability.data.reduce((sum, d) => sum + d.renewableEnergy, 0) / sustainability.data.length;
        if (avgRenewable < 20) {
          notifs.push({
            id: 'low-renewable',
            type: 'info',
            title: 'Low Renewable Energy Usage',
            message: `Only ${avgRenewable.toFixed(1)}% renewable energy. Consider solar panels or green energy providers to reduce carbon footprint.`,
            time: 'This week',
            icon: Leaf,
            color: 'text-info'
          });
        }

        const totalWaste = sustainability.data.reduce((sum, d) => sum + d.wasteGenerated, 0);
        const totalRecycled = sustainability.data.reduce((sum, d) => sum + d.wasteRecycled, 0);
        const recyclingRate = totalWaste > 0 ? (totalRecycled / totalWaste) * 100 : 0;

        if (recyclingRate < 40 && totalWaste > 0) {
          notifs.push({
            id: 'low-recycling',
            type: 'info',
            title: 'Improve Recycling Rate',
            message: `Current recycling rate: ${recyclingRate.toFixed(1)}%. Implement better waste segregation to increase sustainability.`,
            time: 'This week',
            icon: Leaf,
            color: 'text-info'
          });
        }
      }

      // Check financial performance
      if (analytics.data && analytics.data.length > 0) {
        const totalRevenue = analytics.data.reduce((sum, d) => sum + d.revenue, 0);
        const totalCosts = analytics.data.reduce((sum, d) => sum + d.costs, 0);
        const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

        if (profitMargin < 10 && totalRevenue > 0) {
          notifs.push({
            id: 'low-profit',
            type: 'alert',
            title: 'Low Profit Margin',
            message: `Current profit margin: ${profitMargin.toFixed(1)}%. Review costs and pricing strategy to improve profitability.`,
            time: 'Today',
            icon: TrendingUp,
            color: 'text-destructive'
          });
        }

        if (profitMargin > 30) {
          notifs.push({
            id: 'high-profit',
            type: 'success',
            title: 'Excellent Profit Margin',
            message: `Profit margin at ${profitMargin.toFixed(1)}%! Your business is performing well. Consider reinvesting in growth.`,
            time: 'This week',
            icon: TrendingUp,
            color: 'text-success'
          });
        }
      }

      // If no notifications, add a welcome message
      if (notifs.length === 0) {
        notifs.push({
          id: 'welcome',
          type: 'info',
          title: 'All Clear!',
          message: 'No urgent notifications at the moment. Your business is running smoothly. Keep up the good work!',
          time: 'Now',
          icon: CheckCircle,
          color: 'text-success'
        });
      }

      setNotifications(notifs);
      setLoading(false);
    };

    generateNotifications();
  }, [user]);

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'alert': return 'bg-destructive/10 border-destructive/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'success': return 'bg-success/10 border-success/20';
      case 'info': return 'bg-info/10 border-info/20';
      default: return 'bg-accent border-border';
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'alert': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>;
      case 'warning': return <Badge className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'success': return <Badge className="bg-success/10 text-success border-success/20">Success</Badge>;
      case 'info': return <Badge className="bg-info/10 text-info border-info/20">Info</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated with important alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl border p-4 shadow-sm ${getTypeColor(notif.type)}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getTypeColor(notif.type)}`}>
                <notif.icon className={`h-5 w-5 ${notif.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{notif.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {getTypeBadge(notif.type)}
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
