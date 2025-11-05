import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  className?: string;
}

export default function ConfidenceMeter({ value, label = "Confidence", className }: ConfidenceMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val: number) => {
    if (val >= 80) return "from-green-500 to-emerald-500";
    if (val >= 60) return "from-blue-500 to-cyan-500";
    if (val >= 40) return "from-yellow-500 to-orange-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <div className={cn("space-y-2", className)} data-testid="confidence-meter">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="relative h-8 rounded-lg bg-muted border border-border overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-gradient-to-r transition-all duration-1000 ease-out",
            getColor(value)
          )}
          style={{ width: `${animatedValue}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-foreground/80 mix-blend-difference">
            {animatedValue.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
