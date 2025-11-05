import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import { useState, useEffect } from "react";

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
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/\D/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      
      setDisplayValue(Math.floor(easeOutQuad * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  return (
    <GlassCard hover className={cn("group", className)}>
      <div className="flex items-start justify-between mb-4" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <motion.div 
          className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-purple/10 border border-primary/20 relative overflow-hidden"
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 10,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan/20 to-magenta/20"
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <Icon className="w-5 h-5 text-primary relative z-10" />
        </motion.div>
        {trend && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </motion.span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{title}</p>
        <motion.p 
          className="text-4xl font-bold tabular-nums bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {typeof value === 'number' ? displayValue.toLocaleString() : value}
        </motion.p>
      </div>
      
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan via-primary to-magenta"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </GlassCard>
  );
}
