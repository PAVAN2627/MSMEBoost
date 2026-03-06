import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const Sustainability = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Sustainability & Resources</h1>
      <p className="text-sm text-muted-foreground">Track resource usage and get eco-friendly recommendations</p>
    </div>

    <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
        <Package className="h-8 w-8 text-success" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Sustainability Tracking Coming Soon
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Track energy consumption, waste management, and get sustainability recommendations to reduce your environmental impact.
      </p>
      <Link to="/dashboard">
        <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
          Go to Dashboard
        </button>
      </Link>
    </div>
  </DashboardLayout>
);

export default Sustainability;
