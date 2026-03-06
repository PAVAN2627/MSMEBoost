import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import AISection from "@/components/landing/AISection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AnalyticsSection />
      <AISection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
