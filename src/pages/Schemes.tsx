import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Globe, Search, Sparkles, Building2, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleAIService } from "@/services/googleAIService";
import { motion } from "framer-motion";

const Schemes = () => {
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [schemes, setSchemes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchSchemes = async () => {
    if (!businessType || !industry || !location) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setSearched(true);
    const { text, error } = await googleAIService.getSchemes(businessType, industry, location);
    setLoading(false);

    if (error) {
      setSchemes(`Error: ${error}. Please check your API key configuration.`);
    } else if (text) {
      setSchemes(text);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" /> Government Schemes
        </h1>
        <p className="text-sm text-muted-foreground">Discover funding and support programs for your MSME</p>
      </div>

      {/* Search Form */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" /> Find Relevant Schemes
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Business Type
            </label>
            <Input
              placeholder="e.g., Manufacturing, Service-based"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Industry
            </label>
            <Input
              placeholder="e.g., Textiles, IT Services"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </label>
            <Input
              placeholder="e.g., Maharashtra, Karnataka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={searchSchemes}
          disabled={loading}
          className="gradient-primary text-primary-foreground border-0 mt-4 w-full md:w-auto"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" /> Find Schemes
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">
            Available Schemes
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for relevant schemes...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {schemes}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Info Cards */}
      {!searched && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h4 className="font-semibold text-foreground mb-2">MUDRA Yojana</h4>
            <p className="text-sm text-muted-foreground">Loans up to ₹10 lakhs for micro enterprises</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h4 className="font-semibold text-foreground mb-2">Credit Guarantee Scheme</h4>
            <p className="text-sm text-muted-foreground">Collateral-free loans for MSMEs</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h4 className="font-semibold text-foreground mb-2">ZED Certification</h4>
            <p className="text-sm text-muted-foreground">Zero Defect Zero Effect manufacturing support</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Schemes;
