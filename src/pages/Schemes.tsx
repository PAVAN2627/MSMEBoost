import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Globe, Search, Sparkles, Building2, MapPin, Briefcase, History, FileText, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { googleAIService } from "@/services/googleAIService";
import { schemesService, SchemeSearch } from "@/services/schemesService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const businessTypes = [
  "Manufacturing",
  "Service-based",
  "Hybrid (Manufacturing + Service)",
  "Trading",
  "Retail",
];

const industries = [
  "Textiles & Apparel",
  "Food Processing",
  "IT & Software Services",
  "Electronics & Hardware",
  "Automotive & Auto Components",
  "Chemicals & Pharmaceuticals",
  "Engineering & Machinery",
  "Handicrafts & Artisan",
  "Healthcare Services",
  "Education & Training",
  "Consulting Services",
  "Logistics & Transportation",
  "Construction & Infrastructure",
  "Agriculture & Agro-processing",
  "Leather & Footwear",
  "Furniture & Woodwork",
  "Printing & Packaging",
  "Metal & Metal Products",
  "Plastics & Rubber",
  "Other",
];

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman & Nicobar Islands",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Lakshadweep",
];

const Schemes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [schemes, setSchemes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SchemeSearch[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load search history
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      const { searches } = await schemesService.getSearches(user.uid, 20);
      if (searches) setSearchHistory(searches);
      setLoadingHistory(false);
    };

    loadHistory();
  }, [user]);

  const saveSearch = async () => {
    if (!user || !schemes || !businessType || !industry || !location) return;

    const search: Omit<SchemeSearch, 'id'> = {
      userId: user.uid,
      businessType,
      industry,
      location,
      schemes,
      createdAt: new Date()
    };

    const { error } = await schemesService.saveSearch(search);
    
    if (!error) {
      // Reload history
      const { searches } = await schemesService.getSearches(user.uid, 20);
      if (searches) setSearchHistory(searches);
      
      toast({
        title: "Search Saved",
        description: "Your schemes search has been saved to history.",
      });
    }
  };

  const loadHistoryItem = (item: SchemeSearch) => {
    setBusinessType(item.businessType);
    setIndustry(item.industry);
    setLocation(item.location);
    setSchemes(item.schemes);
    setSearched(true);
    setShowHistory(false);
  };

  const searchSchemes = async () => {
    if (!businessType || !industry || !location) {
      alert("Please select all fields");
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Government Schemes
          </h1>
          <p className="text-sm text-muted-foreground">Discover funding and support programs for your MSME</p>
        </div>
        {searched && schemes && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveSearch}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Search
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
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
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Industry
            </label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> State/UT
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Available Schemes for Your Business
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for relevant schemes...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ 
                  __html: schemes
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
                    .replace(/📋|✅|💰|📞|🔗|📝/g, '<span class="inline-block mr-1">$&</span>')
                }}
              />
              <div className="mt-6 p-4 bg-accent rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Click on the website links to visit official portals. For detailed application procedures, contact the respective ministry or visit your nearest MSME-DI office.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Info Cards */}
      {!searched && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
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

          <div className="rounded-xl border border-border bg-accent/50 p-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" /> How It Works
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Enter your business details above</p>
              <p>✓ Our AI will search through 100+ government schemes</p>
              <p>✓ Get personalized recommendations with:</p>
              <ul className="ml-6 mt-2 space-y-1">
                <li>• Detailed scheme descriptions</li>
                <li>• Eligibility criteria</li>
                <li>• Financial benefits</li>
                <li>• Official website links</li>
                <li>• Step-by-step application process</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Useful Links */}
      {searched && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Useful Resources</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <a 
              href="https://msme.gov.in/schemes-programmes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <Globe className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Ministry of MSME</p>
                <p className="text-xs text-muted-foreground">Official schemes portal</p>
              </div>
            </a>
            <a 
              href="https://udyamregistration.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <Globe className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Udyam Registration</p>
                <p className="text-xs text-muted-foreground">Register your MSME</p>
              </div>
            </a>
            <a 
              href="https://www.mudra.org.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <Globe className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">MUDRA Portal</p>
                <p className="text-xs text-muted-foreground">Micro-finance schemes</p>
              </div>
            </a>
            <a 
              href="https://www.cgtmse.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <Globe className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">CGTMSE</p>
                <p className="text-xs text-muted-foreground">Credit guarantee schemes</p>
              </div>
            </a>
          </div>
        </div>
      )}
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex flex-col"
          >
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-info" /> Search History
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Your past scheme searches</p>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-card">
              {loadingHistory ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading history...
                </div>
              ) : searchHistory.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No saved searches yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {searchHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full p-4 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-info mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {item.businessType}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.industry} • {item.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schemes;
