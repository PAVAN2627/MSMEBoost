import { motion } from "framer-motion";
import { Brain, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const aiFeatures = [
  {
    icon: Brain,
    title: "Smart Recommendations",
    desc: "Get personalized suggestions for cost optimization, efficiency improvements, and growth opportunities"
  },
  {
    icon: Target,
    title: "Predictive Insights",
    desc: "Anticipate bottlenecks, demand patterns, and resource needs before they become issues"
  },
  {
    icon: Sparkles,
    title: "Automated Analysis",
    desc: "AI continuously monitors your operations and alerts you to anomalies and opportunities"
  },
  {
    icon: Zap,
    title: "Instant Answers",
    desc: "Ask questions about your business and get immediate, data-backed responses"
  }
];

const AISection = () => (
  <section id="ai" className="py-20 lg:py-28">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 mb-4">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">Powered by Google Gemini AI</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Your AI-Powered <span className="text-secondary">Business Advisor</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Get expert guidance 24/7 with our intelligent assistant trained on MSME best practices
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {aiFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <f.icon className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl gradient-hero p-8 lg:p-12"
      >
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-4">
              Ask Anything About Your Business
            </h3>
            <div className="space-y-3 mb-6">
              <div className="rounded-lg bg-background/10 backdrop-blur-sm p-3 text-primary-foreground/90">
                "How can I reduce my production costs?"
              </div>
              <div className="rounded-lg bg-background/10 backdrop-blur-sm p-3 text-primary-foreground/90">
                "What government schemes am I eligible for?"
              </div>
              <div className="rounded-lg bg-background/10 backdrop-blur-sm p-3 text-primary-foreground/90">
                "Which machines should I upgrade first?"
              </div>
            </div>
            <Link to="/register">
              <Button size="lg" className="gradient-accent text-secondary-foreground border-0">
                Try AI Advisor Free
              </Button>
            </Link>
          </div>
          <div className="rounded-xl bg-background/10 backdrop-blur-sm p-8 text-center">
            <div className="text-7xl mb-4">🤖</div>
            <p className="text-primary-foreground/80 text-lg">
              Powered by advanced AI to understand your unique business context and provide tailored recommendations
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AISection;
