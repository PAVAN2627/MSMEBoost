import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Notifications = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
      <p className="text-sm text-muted-foreground">Stay updated with important alerts</p>
    </div>

    <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
        <Bell className="h-8 w-8 text-secondary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        No Notifications Yet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You'll receive notifications here for important updates, deadlines, and system alerts.
      </p>
      <Link to="/dashboard">
        <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
          Go to Dashboard
        </button>
      </Link>
    </div>
  </DashboardLayout>
);

export default Notifications;
