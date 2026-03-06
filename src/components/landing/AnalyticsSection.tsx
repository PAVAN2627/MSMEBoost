import { motion } from "framer-motion";
import { TrendingUp, PieChart, Activity, DollarSign } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp,
    value: "3x",
    label: "Faster Decision Making",
    desc: "Real-time insights help you act quickly"
  },
  {
    icon: PieChart,
    value: "40%",
    label: "Cost Reduction",
    desc: "Identify inefficiencies and optimize resources"
  },
  {
    icon: Activity,
    value: "85%",
    label: "Efficiency Boost",
    desc: "Streamline operations with data-driven planning"
  },
  {
    icon: DollarSign,
    value: "2.5x",
    label: "Revenue Growth",
    desc: "Scale smarter with predictive analytics"
  }
];

const AnalyticsSection = () => (
  <section id="analytics" className="py-20 lg:py-28 bg-accent/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Data-Driven <span className="text-secondary">Insights</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Transform raw data into actionable intelligence for your business
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
              <m.icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="font-display text-4xl font-bold text-foreground mb-2">
              {m.value}
            </div>
            <div className="font-semibold text-foreground mb-1">{m.label}</div>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Comprehensive Analytics Dashboard
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Production Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitor daily output and efficiency</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-info/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-info" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Financial Metrics</p>
                  <p className="text-sm text-muted-foreground">Revenue, costs, and profit margins</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Resource Utilization</p>
                  <p className="text-sm text-muted-foreground">Machine and workforce efficiency</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-accent/50 p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-muted-foreground">
              Visualize trends, identify patterns, and make informed decisions with our intuitive analytics platform
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AnalyticsSection;
