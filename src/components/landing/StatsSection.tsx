import { motion } from "framer-motion";

const stats = [
  { value: "6.3 Cr+", label: "MSMEs in India" },
  { value: "30%", label: "GDP Contribution" },
  { value: "11 Cr+", label: "Jobs Created" },
  { value: "45%", label: "Manufacturing Output" },
];

const StatsSection = () => (
  <section className="gradient-hero py-16 lg:py-20">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-primary-foreground/70">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
