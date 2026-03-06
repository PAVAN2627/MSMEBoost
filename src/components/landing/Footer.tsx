import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            MSME<span className="text-secondary">Boost</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 MSMEBoost. Empowering Indian MSMEs with AI.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
