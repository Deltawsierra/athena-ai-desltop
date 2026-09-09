/**
 * Athena's scan page: one system, watched end to end while it is taken apart.
 *
 * The layout is a claim in three parts, read left to right. What is being
 * scanned (the target), how far the scan has got and through what (the ring and
 * its modules), and what Athena is thinking while she does it (the reasoning).
 * Underneath, the readings a decision is actually made on: a risk score, the
 * shape of the findings, how much of the system has been covered, and what
 * sensitive data is exposed -- then the findings themselves.
 *
 * Every figure comes from one fixture (`SAMPLE_SCAN`) shaped like a live scan,
 * so wiring this to the engine is a swap of the source, not a redraw.
 */
import { ChevronRight, Lock, Landmark, FileText, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import ScanProgress from "@/components/athena/ScanProgress";
import AthenaReasoning from "@/components/athena/AthenaReasoning";
import RiskDial from "@/components/athena/RiskDial";
import { cn } from "@/lib/utils";
import {
  SAMPLE_SCAN,
  SCAN_STAGES,
  SEVERITY_ORDER,
  type Finding,
  type Severity,
} from "@/lib/athenaScan";

const SEVERITY_LABEL: Record<Exclude<Severity, "info">, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const key = severity as Exclude<Severity, "info">;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
      style={{
        color: `hsl(var(--sev-${severity}))`,
        borderColor: `hsl(var(--sev-${severity}) / 0.4)`,
        background: `hsl(var(--sev-${severity}) / 0.1)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `hsl(var(--sev-${severity}))` }}
      />
      {SEVERITY_LABEL[key] ?? severity}
    </span>
  );
}

const EXPOSURE_ICON = {
  pii: Lock,
  financial: Landmark,
  internal: FileText,
  credential: KeyRound,
} as const;

function ImpactText({ impact }: { impact: Finding["impact"] }) {
  const tone =
    impact === "High"
      ? "text-sev-high"
      : impact === "Medium"
        ? "text-sev-medium"
        : "text-muted-foreground";
  return <span className={cn("text-[13px] font-medium", tone)}>{impact}</span>;
}

export default function AthenaScan() {
  const scan = SAMPLE_SCAN;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
      {/* ---- Hero -------------------------------------------------------- */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground">
            Athena
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            See the system. Understand the risks. Deploy with confidence.
          </p>
        </div>
        <div className="flex items-start gap-10 pt-2">
          <ul className="space-y-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            {SCAN_STAGES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="space-y-1 border-l border-border/50 pl-10 text-[10px] uppercase tracking-[0.24em]">
            <p className="text-gold">Greater</p>
            <p className="text-gold">Clarity</p>
            <p className="mt-2 text-muted-foreground/70">Safer AI</p>
          </div>
        </div>
      </div>

      {/* ---- Top row ----------------------------------------------------- */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
        {/* Scan target */}
        <GlassCard hover={false} className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="athena-label">Scan Target</p>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <span className="athena-live h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.9)]" />
              Running
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-foreground">
            {scan.target.name}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {scan.target.version} &nbsp;|&nbsp; {scan.target.environment}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {scan.target.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {scan.target.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border/70 bg-surface-1/50 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4">
            {[
              { k: "Started", v: scan.target.startedLabel },
              { k: "Elapsed", v: scan.target.elapsedLabel },
              { k: "Est. Completion", v: scan.target.etaLabel },
            ].map((x) => (
              <div key={x.k}>
                <p className="athena-label">{x.k}</p>
                <p className="mt-1 text-[13px] font-medium text-foreground">{x.v}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Scan progress */}
        <GlassCard hover={false} glow={false} className="flex items-center">
          <div className="w-full">
            <ScanProgress modules={scan.modules} percent={scan.percent} />
          </div>
        </GlassCard>

        {/* Reasoning */}
        <GlassCard hover={false} ruling className="flex flex-col">
          <AthenaReasoning narration={scan.narration} entries={scan.reasoning} />
        </GlassCard>
      </div>

      {/* ---- Metric row -------------------------------------------------- */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Risk overview */}
        <GlassCard className="flex flex-col">
          <p className="athena-label">Risk Overview</p>
          <div className="mt-3 flex items-center gap-4">
            <RiskDial score={scan.risk.score} band={scan.risk.band} />
            <div className="min-w-0">
              <p className="whitespace-nowrap text-base font-semibold text-gold">{scan.risk.band} Risk</p>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                {scan.risk.summary}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Findings */}
        <GlassCard className="flex flex-col">
          <p className="athena-label">Findings</p>
          <div className="mt-2 flex items-center gap-5">
            <div className="shrink-0">
              <span className="athena-figure text-[44px] font-semibold leading-none text-foreground">
                {scan.findings.total}
              </span>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Total findings</p>
            </div>
            <ul className="flex-1 space-y-1.5">
              {SEVERITY_ORDER.map((sev) => (
                <li key={sev} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: `hsl(var(--sev-${sev}))` }}
                    />
                    {SEVERITY_LABEL[sev]}
                  </span>
                  <span className="font-medium text-foreground">
                    {scan.findings.bySeverity[sev]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        {/* Coverage */}
        <GlassCard>
          <p className="athena-label">Scan Coverage</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="athena-figure text-4xl font-semibold text-foreground">
              {scan.coverage.completed}
            </span>
            <span className="text-lg text-muted-foreground">/ {scan.coverage.total}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Modules complete</p>
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold"
                initial={{ width: 0 }}
                animate={{ width: `${scan.coverage.percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] font-medium text-gold">
              {scan.coverage.percent}%
            </p>
          </div>
        </GlassCard>

        {/* Data exposure */}
        <GlassCard>
          <p className="athena-label">Data Exposure</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="athena-figure text-4xl font-semibold text-foreground">
              {scan.dataExposure.length}
            </span>
            <span className="text-[12px] text-muted-foreground">Sensitive data types</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {scan.dataExposure.map((d) => {
              const Icon = EXPOSURE_ICON[d.kind] ?? Lock;
              return (
                <span
                  key={d.label}
                  className="inline-flex items-center gap-1 rounded-md border border-gold-dim/40 bg-gold/[0.06] px-2 py-1 text-[11px] font-medium text-gold"
                >
                  <Icon className="h-3 w-3" />
                  {d.label}
                </span>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ---- Top findings ------------------------------------------------ */}
      <GlassCard hover={false} glow={false} className="mt-5">
        <div className="flex items-center justify-between">
          <p className="athena-label">Top Findings</p>
          <a
            href="/findings"
            className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
          >
            View all findings <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4 -mx-2 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="text-left align-middle">
                {["#", "Severity", "Finding", "Category", "Affected Area", "Impact", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="athena-label px-2 pb-3 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {scan.findings.top.map((f, i) => (
                <tr
                  key={f.id}
                  data-testid={`finding-${f.id}`}
                  className="border-t border-border/40 align-middle hover:bg-surface-1/40"
                >
                  <td className="px-2 py-3 text-[13px] text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-2 py-3 text-[13px] font-medium text-foreground">
                    {f.title}
                  </td>
                  <td className="px-2 py-3 text-[13px] text-muted-foreground">{f.category}</td>
                  <td className="px-2 py-3 text-[13px] text-muted-foreground">{f.area}</td>
                  <td className="px-2 py-3">
                    <ImpactText impact={f.impact} />
                  </td>
                  <td className="px-2 py-3">
                    <button className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface-1/50 px-2.5 py-1 text-[12px] font-medium text-foreground hover:border-primary/50">
                      {f.status}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
