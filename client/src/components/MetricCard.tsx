import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <GlassCard hover className={cn("", className)}>
      <div className="flex items-start justify-between mb-4" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{title}</p>
        <p className="text-4xl font-bold tabular-nums animate-count-up">{value}</p>
      </div>
    </GlassCard>
  );
}
