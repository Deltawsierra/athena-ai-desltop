import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

type Severity = "high" | "medium" | "low" | "critical" | "info";

interface ThreatBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: {
    bg: "bg-destructive/10 border-destructive/30",
    text: "text-destructive",
    icon: AlertTriangle,
    pulse: true,
  },
  high: {
    bg: "bg-destructive/10 border-destructive/30",
    text: "text-destructive",
    icon: AlertTriangle,
    pulse: true,
  },
  medium: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-600 dark:text-yellow-400",
    icon: AlertTriangle,
    pulse: false,
  },
  low: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: Info,
    pulse: false,
  },
  info: {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    icon: Shield,
    pulse: false,
  },
};

export default function ThreatBadge({ severity, className }: ThreatBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border relative overflow-hidden",
        config.bg,
        config.text,
        className
      )}
      data-testid={`badge-${severity}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...(config.pulse ? {
          boxShadow: [
            "0 0 0px rgba(239, 68, 68, 0)",
            "0 0 15px rgba(239, 68, 68, 0.4)",
            "0 0 0px rgba(239, 68, 68, 0)",
          ],
        } : {})
      }}
      transition={{
        scale: { duration: 0.3, ease: "backOut" },
        opacity: { duration: 0.2 },
        boxShadow: config.pulse ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        } : undefined,
      }}
      whileHover={{
        scale: 1.05,
        y: -1,
      }}
    >
      {config.pulse && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      <Icon className="w-3 h-3 relative z-10" />
      <span className="relative z-10">{severity}</span>
    </motion.span>
  );
}
