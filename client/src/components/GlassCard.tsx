/**
 * The surface everything in this app sits on.
 *
 * Which makes it the cheapest place to put the house style: eleven screens
 * were built before there was one, and editing eleven screens to add a corner
 * is how a design system becomes eleven slightly different design systems.
 *
 * Three deliberate changes from what was here. The hover was a six-pixel lift
 * and a one-percent scale on every card, which is a lot of movement for a
 * panel of numbers somebody is reading -- an instrument should not flinch
 * when the pointer crosses it. The accent gradient ran cyan to magenta, and
 * there is no magenta in the mark: it runs cobalt through indigo into gold,
 * and the gold half is the point. And the corners are drawn, because the
 * brand art frames its viewport in brackets and a stele has corners.
 */

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  /**
   * Marks a surface carrying a judgement rather than a measurement -- an
   * approval, a verified chain, a signature that checked out. Turns the
   * hairline and the corners gold, which is reserved for exactly that.
   */
  ruling?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = true,
  ruling = false,
}: GlassCardProps) {
  // Somebody who has asked their operating system to stop moving things has
  // asked this too.
  const still = useReducedMotion();
  const accent = ruling ? "var(--gold)" : "var(--primary)";

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl backdrop-blur-md bg-card/40",
        "border border-card-border/50 shadow-lg",
        className,
      )}
      whileHover={
        hover && !still
          ? { y: -2, boxShadow: "0 18px 40px -18px rgba(0,0,0,0.55)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      style={{ willChange: "transform, box-shadow" }}
    >
      {/* One hairline of accent along the top edge. The cheapest way to make
          a rectangle look engineered rather than drawn, and it costs no
          layout. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl"
        style={{
          background:
            `linear-gradient(90deg, transparent, hsl(${accent} / 0.55) 22%, ` +
            `hsl(${accent} / 0.55) 78%, transparent)`,
        }}
      />

      {/* The corners. Two spans rather than a border, so the sides stay open:
          a closed box reads as a dialog, and these are surfaces. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-[18px] h-[18px] rounded-tl-xl"
        style={{
          borderTop: `1px solid hsl(${accent} / 0.55)`,
          borderLeft: `1px solid hsl(${accent} / 0.55)`,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px -right-px w-[18px] h-[18px] rounded-br-xl"
        style={{
          borderBottom: `1px solid hsl(${accent} / 0.55)`,
          borderRight: `1px solid hsl(${accent} / 0.55)`,
        }}
      />

      {glow && !still && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0"
          style={{
            background:
              `linear-gradient(135deg, hsl(var(--primary) / 0.10), ` +
              `hsl(var(--accent-violet) / 0.06) 55%, hsl(var(--gold) / 0.08))`,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
      )}

      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
}
