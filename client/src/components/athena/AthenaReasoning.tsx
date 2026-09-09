/**
 * Athena thinking out loud. A pull-quote of the current thought over a reverse
 * chronological log, so the newest line is the one under the quote and the eye
 * lands there. The point of showing the reasoning at all is that a scan people
 * cannot watch is a scan people cannot trust; this is the window.
 */
import { motion } from "framer-motion";
import athenaOwl from "@assets/mythos/owl-medallion.webp";
import type { ReasoningEntry } from "@/lib/athenaScan";

export default function AthenaReasoning({
  narration,
  entries,
  live = true,
}: {
  narration: string;
  entries: ReasoningEntry[];
  live?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className="athena-label">Athena Reasoning</p>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-primary">
            <span className="athena-live h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.9)]" />
            Live
          </span>
        )}
      </div>

      {/* Current thought */}
      <div className="mt-4 flex gap-3">
        <img
          src={athenaOwl}
          alt="Athena"
          className="h-9 w-9 shrink-0 select-none object-contain"
        />
        <p className="text-sm italic leading-relaxed text-foreground/90">
          “{narration}”
        </p>
      </div>

      {/* Log */}
      <ol className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {entries.map((e, i) => (
          <motion.li
            key={`${e.time}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            className="flex items-start gap-3 text-[13px]"
          >
            <span
              className={
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                (i === 0 ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.9)]" : "bg-muted-foreground/40")
              }
            />
            <span className="athena-mono shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {e.time}
            </span>
            <span className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
              {e.text}
            </span>
          </motion.li>
        ))}
      </ol>

      {/* Working line */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-muted-foreground">
        <span className="athena-live h-1.5 w-1.5 rounded-full bg-gold" />
        Athena is working…
      </div>
    </div>
  );
}
