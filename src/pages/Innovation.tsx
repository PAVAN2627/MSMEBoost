import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Lightbulb, Rocket, Cpu, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { innovationService } from "@/services/innovationService";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const statusColor = (s: string) => {
  if (s === "Completed") return "bg-success/10 text-success border-success/20";
  if (s === "In Progress") return "bg-info/10 text-info border-info/20";
  if (s === "R&D") return "bg-secondary/10 text-secondary border-secondary/20";
  return "bg-muted text-muted-foreground";
};

const Innovation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Planning");
  const [progress, setProgress] = useState("0");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { projects: projectData } = await innovationService.getProjects(user.uid);
      if (projectData) setProjects(projectData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleCreateProject = async () => {
    if (!projectName || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { id, error } = await innovationService.createProject({
      userId: user!.uid,
      name: projectName,
      category,
      status: status as any,
      progress: parseInt(progress),
      startDate: new Date(),
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
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
        description: "Project created successfully!",
      });
      setDialogOpen(false);
      // Reset form
      setProjectName("");
      setCategory("");
      setStatus("Planning");
      setProgress("0");
      // Refresh projects
      const { projects: projectData } = await innovationService.getProjects(user!.uid);
      if (projectData) setProjects(projectData);
    }
  };

  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const innovationScore = projects.length > 0 
    ? projects.slice(-6).map((p, i) => ({
        month: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short' }),
        score: Math.min(100, 30 + (i * 5) + p.progress / 3)
      }))
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading innovation data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Innovation Tracker</h1>
          <p className="text-sm text-muted-foreground">Track R&D projects and technology adoption</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Innovation Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., AI-powered Quality Control"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automation">Automation</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="IoT">IoT</SelectItem>
                    <SelectItem value="Process Improvement">Process Improvement</SelectItem>
                    <SelectItem value="Product Development">Product Development</SelectItem>
                    <SelectItem value="Technology Upgrade">Technology Upgrade</SelectItem>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary text-primary-foreground border-0"
                onClick={handleCreateProject}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Score + Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {[
        { label: "Innovation Score", value: `${avgProgress}/100`, icon: Lightbulb, color: "text-secondary" },
        { label: "Active R&D Projects", value: activeProjects.toString(), icon: Rocket, color: "text-info" },
        { label: "Tech Adoption Rate", value: projects.length > 0 ? `${Math.min(100, projects.length * 15)}%` : "0%", icon: Cpu, color: "text-success" },
      ].map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{s.value}</p>
        </motion.div>
      ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {/* Score Trend */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Innovation Score Trend</h3>
        <div className="h-56">
          {innovationScore.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={innovationScore}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(38, 92%, 55%)" strokeWidth={3} dot={{ fill: "hsl(38, 92%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data yet. Add projects to see progress.
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-secondary" /> Innovation Tips
        </h3>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-sm text-foreground">Start Your First Project</p>
            <p className="text-sm text-muted-foreground mt-1">Track R&D initiatives, technology adoption, and innovation efforts to measure progress.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-sm text-foreground">Set Clear Goals</p>
            <p className="text-sm text-muted-foreground mt-1">Define target dates and milestones for each innovation project to stay on track.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-sm text-foreground">Monitor Progress</p>
            <p className="text-sm text-muted-foreground mt-1">Regular updates help identify bottlenecks and celebrate achievements.</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:col-span-2">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Innovation Projects</h3>
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No innovation projects yet. Click "New Project" to get started.</p>
          <Link to="/dashboard">
            <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg border-0 font-medium">
              Go to Dashboard
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <Badge className={statusColor(p.status)}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{p.progress}%</span>
                </div>
              </div>
              <Badge variant="outline">{p.category}</Badge>
            </div>
          ))}
        </div>
      )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Innovation;
