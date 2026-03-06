import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { User, Building2, Bell, Shield, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { userProfileService } from "@/services/userProfileService";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // User Profile Settings
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email] = useState(user?.email || "");
  const [role, setRole] = useState("owner");
  
  // Business Settings
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("manufacturing");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("small");
  const [location, setLocation] = useState("");
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  // Appearance Settings
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  
  const [saving, setSaving] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { profile, error } = await userProfileService.getProfile(user.uid);
      
      if (profile) {
        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setDisplayName(`${profile.firstName} ${profile.lastName}`);
        setRole(profile.role || "owner");
        setBusinessName(profile.companyName || "");
        setBusinessType(profile.businessType || "manufacturing");
        setIndustry(profile.industry || "");
        setCompanySize(profile.companySize || "small");
        setLocation(profile.location || "");
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    // Try to update first
    let result = await userProfileService.updateProfile(user.uid, {
      firstName,
      lastName,
      role
    });
    
    // If no document exists, create it
    if (result.error && result.error.includes('No document')) {
      result = await userProfileService.createProfile({
        userId: user.uid,
        firstName,
        lastName,
        email: user.email || '',
        role,
        companyName: businessName,
        industry,
        companySize,
        location,
        businessType
      });
    }
    
    setSaving(false);
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setDisplayName(`${firstName} ${lastName}`);
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    }
  };

  const handleSaveBusiness = async () => {
    if (!user) return;
    
    setSaving(true);
    
    // Try to update first
    let result = await userProfileService.updateProfile(user.uid, {
      companyName: businessName,
      businessType,
      industry,
      companySize,
      location
    });
    
    // If no document exists, create it
    if (result.error && result.error.includes('No document')) {
      result = await userProfileService.createProfile({
        userId: user.uid,
        firstName,
        lastName,
        email: user.email || '',
        role,
        companyName: businessName,
        industry,
        companySize,
        location,
        businessType
      });
    }
    
    setSaving(false);
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Business Settings Updated",
        description: "Your business information has been saved successfully.",
      });
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Notification Preferences Updated",
        description: "Your notification settings have been saved successfully.",
      });
    }, 1000);
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Appearance Settings Updated",
        description: "Your appearance preferences have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
          </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">MSME Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="gradient-primary text-primary-foreground border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </motion.div>

        {/* Business Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
              <Building2 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Business Information</h2>
              <p className="text-sm text-muted-foreground">Configure your business details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="service">Service-based</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Micro (1-10)</SelectItem>
                    <SelectItem value="small">Small (11-50)</SelectItem>
                    <SelectItem value="medium">Medium (51-250)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., IT, Textiles, Food"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveBusiness}
              disabled={saving}
              className="gradient-primary text-primary-foreground border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Business Info"}
            </Button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <Bell className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="orderAlerts">Order Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about order deadlines</p>
              </div>
              <Switch
                id="orderAlerts"
                checked={orderAlerts}
                onCheckedChange={setOrderAlerts}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                <p className="text-sm text-muted-foreground">Equipment maintenance reminders</p>
              </div>
              <Switch
                id="maintenanceAlerts"
                checked={maintenanceAlerts}
                onCheckedChange={setMaintenanceAlerts}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly business summary</p>
              </div>
              <Switch
                id="weeklyReports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>

            <Button 
              onClick={handleSaveNotifications}
              disabled={saving}
              className="gradient-primary text-primary-foreground border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Palette className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how MSMEBoost looks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSaveAppearance}
              disabled={saving}
              className="gradient-primary text-primary-foreground border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Appearance"}
            </Button>
          </div>
        </motion.div>

        {/* Account Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Account Security</h2>
              <p className="text-sm text-muted-foreground">Manage your account security</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </>
      )}
    </DashboardLayout>
  );
};

export default Settings;
