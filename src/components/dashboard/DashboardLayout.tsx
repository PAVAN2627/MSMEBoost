import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <DashboardSidebar />
    <main className="ml-60 flex-1 p-6 lg:p-8">{children}</main>
  </div>
);

export default DashboardLayout;
