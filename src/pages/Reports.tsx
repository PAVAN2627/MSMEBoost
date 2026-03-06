import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
      <p className="text-sm text-muted-foreground">Generate and download business reports</p>
    </div>

    <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10">
        <FileText className="h-8 w-8 text-info" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Reports Coming Soon
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Generate comprehensive reports on production, analytics, and business performance once you have data.
      </p>
      <Link to="/dashboard">
        <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
          Go to Dashboard
        </button>
      </Link>
    </div>
  </DashboardLayout>
);

export default Reports;
