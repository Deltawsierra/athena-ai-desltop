import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Info } from "lucide-react";

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
    animate: "animate-pulse-glow",
  },
  high: {
    bg: "bg-destructive/10 border-destructive/30",
    text: "text-destructive",
    icon: AlertTriangle,
    animate: "animate-pulse-glow",
  },
  medium: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-600 dark:text-yellow-400",
    icon: AlertTriangle,
    animate: "",
  },
  low: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: Info,
    animate: "",
  },
  info: {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    icon: Shield,
    animate: "",
  },
};

export default function ThreatBadge({ severity, className }: ThreatBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
        config.bg,
        config.text,
        config.animate,
        className
      )}
      data-testid={`badge-${severity}`}
    >
      <Icon className="w-3 h-3" />
      {severity}
    </span>
  );
}
