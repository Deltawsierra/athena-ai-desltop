import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  label,
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("space-y-2", className)} data-testid="progress-bar">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showPercentage && <span className="text-muted-foreground tabular-nums">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-muted border border-border overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
