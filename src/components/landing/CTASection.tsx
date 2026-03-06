import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-20 lg:py-28">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl rounded-3xl gradient-hero p-12 text-center shadow-card-lg lg:p-16"
      >
        <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to transform your MSME?
        </h2>
        <p className="mt-4 text-primary-foreground/70">
          Join thousands of businesses already using AI-powered insights to grow smarter.
        </p>
        <Link to="/dashboard">
          <Button
            size="lg"
            className="mt-8 gradient-accent text-secondary-foreground border-0 gap-2 shadow-glow"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
