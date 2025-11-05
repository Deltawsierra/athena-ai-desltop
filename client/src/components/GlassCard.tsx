import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({ 
  children, 
  className = "", 
  hover = true,
  glow = true 
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl backdrop-blur-md bg-card/40 border border-card-border/50 shadow-lg overflow-hidden",
        "transition-all duration-300",
        className
      )}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              scale: 1.02,
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.15), transparent 50%)",
          }}
          whileHover={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple/5 opacity-0"
        whileHover={{
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
        }}
      />
      
      <div className="relative z-10 p-6">{children}</div>
      
      {glow && (
        <motion.div
          className="absolute -inset-[1px] rounded-xl opacity-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(236, 72, 153, 0.3))",
            filter: "blur(8px)",
          }}
          whileHover={{
            opacity: 0.5,
          }}
          transition={{
            duration: 0.3,
          }}
        />
      )}
    </motion.div>
  );
}
