import { motion } from "framer-motion";
import {
  Factory,
  BarChart3,
  Brain,
  Lightbulb,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Factory,
    title: "Operations Planning",
    desc: "Schedule production/projects, plan capacity, and track orders with intelligent bottleneck detection for both manufacturing and service businesses.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Real-time dashboards for operations, financial, and efficiency metrics with rich visualizations tailored to your industry.",
  },
  {
    icon: Brain,
    title: "AI Business Advisor",
    desc: "Get AI-powered recommendations for cost reduction, efficiency improvement, and market opportunities specific to your business type.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Tracker",
    desc: "Track R&D projects, new service offerings, product ideas, and technology adoption with innovation scoring.",
  },
  {
    icon: Shield,
    title: "Resource Assessment",
    desc: "Evaluate equipment, infrastructure, team efficiency, and capacity utilization with upgrade recommendations.",
  },
  {
    icon: Globe,
    title: "Government Schemes",
    desc: "Discover MSME subsidies, startup schemes, and funding opportunities filtered for manufacturing and service sectors.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 lg:py-28">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Everything your MSME needs to{" "}
          <span className="text-secondary">thrive</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          For manufacturing, services, IT, and every MSME in between.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-lg hover:-translate-y-1"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
