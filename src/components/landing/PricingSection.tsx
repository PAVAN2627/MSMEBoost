import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "Forever",
    desc: "Perfect for getting started",
    features: [
      "Up to 50 production orders",
      "Basic analytics dashboard",
      "AI advisor (10 queries/day)",
      "Government schemes finder",
      "Email support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Professional",
    price: "₹999",
    period: "per month",
    desc: "For growing businesses",
    features: [
      "Unlimited production orders",
      "Advanced analytics & reports",
      "Unlimited AI advisor queries",
      "Innovation tracker",
      "Infrastructure assessment",
      "Priority support",
      "Export data & reports"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact us",
    desc: "For large organizations",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Custom integrations",
      "Dedicated account manager",
      "On-premise deployment option",
      "Custom training & onboarding",
      "24/7 phone support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => (
  <section id="pricing" className="py-20 lg:py-28 bg-accent/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Simple, <span className="text-secondary">Transparent</span> Pricing
        </h2>
        <p className="mt-4 text-muted-foreground">
          Choose the plan that fits your business needs. Start free, upgrade anytime.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-8 shadow-card relative ${
              plan.popular 
                ? "border-primary bg-card scale-105 lg:scale-110" 
                : "border-border bg-card"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/register">
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? "gradient-primary text-primary-foreground border-0" 
                    : "border-border"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-muted-foreground">
          All plans include 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
