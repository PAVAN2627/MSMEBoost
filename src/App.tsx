import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Production from "./pages/Production";
import Analytics from "./pages/Analytics";
import Infrastructure from "./pages/Infrastructure";
import Innovation from "./pages/Innovation";
import AIAdvisor from "./pages/AIAdvisor";
import Sustainability from "./pages/Sustainability";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Schemes from "./pages/Schemes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/production" element={<Production />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/infrastructure" element={<Infrastructure />} />
          <Route path="/dashboard/innovation" element={<Innovation />} />
          <Route path="/dashboard/ai-advisor" element={<AIAdvisor />} />
          <Route path="/dashboard/sustainability" element={<Sustainability />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/schemes" element={<Schemes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
