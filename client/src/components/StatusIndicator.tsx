import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "running" | "error" | "pending";

interface StatusIndicatorProps {
  status: Status;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    text: "Online",
    textColor: "text-green-600 dark:text-green-400",
  },
  running: {
    color: "bg-blue-500 animate-pulse-glow",
    text: "Running",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  pending: {
    color: "bg-yellow-500 animate-pulse",
    text: "Pending",
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  error: {
    color: "bg-red-500 animate-pulse-glow",
    text: "Error",
    textColor: "text-red-600 dark:text-red-400",
  },
  offline: {
    color: "bg-muted-foreground",
    text: "Offline",
    textColor: "text-muted-foreground",
  },
};

export default function StatusIndicator({ 
  status, 
  label, 
  showDot = true, 
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const displayText = label || config.text;

  return (
    <div className={cn("inline-flex items-center gap-2", className)} data-testid={`status-${status}`}>
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.color)} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color)} />
        </span>
      )}
      <span className={cn("text-sm font-medium", config.textColor)}>{displayText}</span>
    </div>
  );
}
