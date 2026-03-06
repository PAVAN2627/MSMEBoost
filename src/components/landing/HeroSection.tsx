import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-secondary" />
              <span className="text-xs font-semibold text-secondary">AI-Powered MSME Platform</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Business,{" "}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Supercharged
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Whether you're manufacturing products or delivering services — plan operations, track performance, discover innovations, and get AI recommendations in one intelligent platform built for Indian MSMEs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 relative z-10">
              <Button 
                type="button"
                size="lg" 
                className="gradient-primary text-primary-foreground border-0 gap-2 shadow-card-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Button clicked!');
                  navigate('/register');
                }}
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
              <div><span className="font-bold text-foreground">10,000+</span> MSMEs</div>
              <div><span className="font-bold text-foreground">30%</span> Avg Efficiency Gain</div>
              <div><span className="font-bold text-foreground">Free</span> to Start</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl shadow-card-lg border border-border">
              <img src={heroImage} alt="MSME Boost Dashboard Preview" className="w-full" />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-card-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                  <p className="font-display text-lg font-bold text-foreground">+28.5%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

import { Zap, TrendingUp } from "lucide-react";

export default HeroSection;
