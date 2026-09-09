/**
 * The instrument at the centre of the scan page: a ring that fills as the run
 * proceeds, flanked by the modules it is working through. The modules sit in
 * two columns that mirror inward, their status glyphs pointing at the ring, so
 * the whole thing reads as one dial being fed from both sides rather than a
 * list beside a circle.
 */
import { motion, useReducedMotion } from "framer-motion";
import mythosGlyph from "@assets/mythos/mark-glyph.webp";
import modDataBoundary from "@assets/mythos/modules/data-boundary.webp";
import modCapabilityMap from "@assets/mythos/modules/capability-map.webp";
import modPersonalContext from "@assets/mythos/modules/personal-context.webp";
import modDataLifecycle from "@assets/mythos/modules/data-lifecycle.webp";
import modTrainingReuse from "@assets/mythos/modules/training-reuse.webp";
import modProviderAssurance from "@assets/mythos/modules/provider-assurance.webp";
import modEffectiveAccess from "@assets/mythos/modules/effective-access.webp";
import modAdversarial from "@assets/mythos/modules/adversarial.webp";
import { cn } from "@/lib/utils";
import {
  MODULE_STATE_META,
  type ScanModule,
} from "@/lib/athenaScan";

/** The struck-brass emblem for each scan module, keyed by module id. */
const MODULE_ICON: Record<string, string> = {
  "data-boundary": modDataBoundary,
  "capability-map": modCapabilityMap,
  "personal-context": modPersonalContext,
  "data-lifecycle": modDataLifecycle,
  "training-reuse": modTrainingReuse,
  "provider-assurance": modProviderAssurance,
  "effective-access": modEffectiveAccess,
  adversarial: modAdversarial,
};

const STATE_DOT: Record<string, string> = {
  done: "bg-primary",
  live: "bg-primary athena-live",
  idle: "bg-muted-foreground/40",
};

function ModuleChip({
  module,
  align,
}: {
  module: ScanModule;
  align: "left" | "right";
}) {
  const meta = MODULE_STATE_META[module.state];
  const live = meta.tone === "live";
  const done = meta.tone === "done";
  const icon = MODULE_ICON[module.id];
  return (
    <div
      data-testid={`module-${module.id}`}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
        align === "left" && "flex-row-reverse text-right",
        live
          ? "border-primary/50 bg-primary/[0.06] shadow-[var(--glow-primary)]"
          : done
            ? "border-border/70 bg-surface-1/50"
            : "border-border/40 bg-surface-0/40",
      )}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className={cn(
            "h-9 w-9 shrink-0 select-none object-contain transition-opacity",
            done || live ? "opacity-100" : "opacity-55",
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[12px] font-medium leading-[1.15]",
            done || live ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {module.label}
        </p>
        <p
          className={cn(
            "mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight",
            align === "left" && "flex-row-reverse",
            live ? "text-primary" : "text-muted-foreground/70",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", STATE_DOT[meta.tone])} />
          {meta.label}
        </p>
      </div>
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  const still = useReducedMotion();
  const size = 272;
  const stroke = 7;
  const r = (size - stroke) / 2 - 22;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;

  // Decorative radial ticks, brighter across the swept arc.
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const swept = i / 72 <= percent / 100;
    const angle = (i / 72) * 2 * Math.PI - Math.PI / 2;
    const inner = r + 10;
    const outer = r + (swept ? 20 : 15);
    return {
      x1: size / 2 + Math.cos(angle) * inner,
      y1: size / 2 + Math.sin(angle) * inner,
      x2: size / 2 + Math.cos(angle) * outer,
      y2: size / 2 + Math.sin(angle) * outer,
      swept,
    };
  });

  return (
    <div className="relative mx-auto aspect-square w-[272px] max-w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(44 90% 72%)" />
            <stop offset="1" stopColor="hsl(38 70% 46%)" />
          </linearGradient>
        </defs>

        {/* ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.swept ? "hsl(44 85% 62% / 0.85)" : "hsl(40 25% 40% / 0.35)"}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* track + concentric guides */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(40 20% 30% / 0.35)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r - 18} fill="none" stroke="hsl(40 20% 30% / 0.22)" strokeWidth={1} />
        <circle cx={size / 2} cy={size / 2} r={r - 36} fill="none" stroke="hsl(40 20% 30% / 0.16)" strokeWidth={1} />

        {/* progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: still ? c - dash : c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: still ? 0 : 1.6, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 8px hsl(44 88% 62% / 0.75))" }}
        />
      </svg>

      {/* center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <img src={mythosGlyph} alt="" aria-hidden="true" className="h-8 w-8 select-none object-contain opacity-90" />
        <span className="athena-figure text-4xl font-semibold text-foreground">
          {percent}%
        </span>
        <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Scan Complete
        </span>
      </div>
    </div>
  );
}

export default function ScanProgress({
  modules,
  percent,
}: {
  modules: ScanModule[];
  percent: number;
}) {
  const left = modules.slice(0, 4);
  const right = modules.slice(4, 8);

  return (
    <div className="flex flex-col">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.34em] text-gold">
          Athena Scan in Progress
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
          Mapping exposure. Testing behavior. Finding truth.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="order-2 space-y-3.5 lg:order-1">
          {left.map((m) => (
            <ModuleChip key={m.id} module={m} align="left" />
          ))}
        </div>

        <div className="order-1 lg:order-2">
          <Ring percent={percent} />
        </div>

        <div className="order-3 space-y-3.5">
          {right.map((m) => (
            <ModuleChip key={m.id} module={m} align="right" />
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
        Probing deeper. A safer tomorrow.
      </p>
    </div>
  );
}
