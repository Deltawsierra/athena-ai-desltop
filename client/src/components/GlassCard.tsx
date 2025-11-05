import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl backdrop-blur-md bg-card/50 border border-card-border p-6",
        "shadow-lg transition-all duration-300",
        hover && "hover:-translate-y-1 hover:shadow-xl hover-elevate",
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-purple/5 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
