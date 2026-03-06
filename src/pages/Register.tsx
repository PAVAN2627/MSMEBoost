import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { userProfileService } from "@/services/userProfileService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("owner");
  
  // Step 2 fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("manufacturing");
  const [companySize, setCompanySize] = useState("small");
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("manufacturing");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    const { user, error } = await signUp(email, password);
    
    if (error) {
      setLoading(false);
      toast({ 
        title: "Registration failed", 
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    // Save user profile to Firestore
    if (user) {
      const profileError = await userProfileService.createProfile({
        userId: user.uid,
        firstName,
        lastName,
        email,
        role,
        companyName,
        industry,
        companySize,
        location,
        businessType
      });
      
      if (profileError.error) {
        console.error('Error saving profile:', profileError.error);
      }
    }
    
    setLoading(false);
    toast({ title: "Account created!", description: "Welcome to MSMEBoost." });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              MSME<span className="text-secondary">Boost</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step} of 2 — {step === 1 ? "Account details" : "Business profile"}
          </p>

          <div className="mt-4 flex gap-2">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "gradient-primary" : "bg-muted"}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "gradient-primary" : "bg-muted"}`} />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Rajesh" 
                      className="mt-1.5" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Kumar" 
                      className="mt-1.5"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="regEmail">Email</Label>
                  <Input 
                    id="regEmail" 
                    type="email" 
                    placeholder="you@company.com" 
                    className="mt-1.5" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="regPassword">Password</Label>
                  <div className="relative mt-1.5">
                    <Input 
                      id="regPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min 8 characters" 
                      className="pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Your role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">MSME Owner</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="companyName">Company name</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Kumar Industries Pvt Ltd" 
                    className="mt-1.5"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry type</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="textiles">Textiles & Garments</SelectItem>
                      <SelectItem value="food">Food Processing</SelectItem>
                      <SelectItem value="chemicals">Chemicals & Pharmaceuticals</SelectItem>
                      <SelectItem value="electronics">Electronics & Hardware</SelectItem>
                      <SelectItem value="automotive">Automotive Parts</SelectItem>
                      <SelectItem value="it-software">IT & Software Services</SelectItem>
                      <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
                      <SelectItem value="education">Education & Training</SelectItem>
                      <SelectItem value="healthcare">Healthcare Services</SelectItem>
                      <SelectItem value="logistics">Logistics & Transportation</SelectItem>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                      <SelectItem value="construction">Construction & Real Estate</SelectItem>
                      <SelectItem value="agriculture">Agriculture & Agro-processing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companySize">Company size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="micro">Micro (1-10)</SelectItem>
                        <SelectItem value="small">Small (11-50)</SelectItem>
                        <SelectItem value="medium">Medium (51-250)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Pune, MH" 
                      className="mt-1.5"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessType">Business type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="service">Service-based</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Manufacturing + Service)</SelectItem>
                      <SelectItem value="trading">Trading & Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1 gradient-primary text-primary-foreground border-0" disabled={loading}>
                {loading ? "Creating..." : step === 1 ? "Continue" : "Create Account"}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden flex-1 items-center justify-center gradient-hero lg:flex">
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Join 10,000+ MSMEs</h2>
          <p className="mt-4 text-primary-foreground/70">
            Start your digital transformation journey today — it's free to get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
