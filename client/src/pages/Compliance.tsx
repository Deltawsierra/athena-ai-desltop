/**
 * Compliance: AI risk turned into audit readiness. Which frameworks are in
 * play, how findings map onto their controls, how ready each one is, and which
 * evidence is still owed. Fixture data, shaped like the API.
 */
import {
  Layers,
  FileText,
  AlertTriangle,
  FileCheck2,
  Box,
  Search,
  ChevronRight,
  Download,
} from "lucide-react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { FrameworkBadge as Badge } from "@/components/mythos/atoms";
import { cn } from "@/lib/utils";

type Cov = "covered" | "partial" | "missing" | "review" | "none";
const COV_META: Record<Cov, { label: string; cls: string }> = {
  covered: { label: "Covered", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  partial: { label: "Partial", cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  missing: { label: "Missing", cls: "text-sev-high border-sev-high/30 bg-sev-high/10" },
  review: { label: "Needs Review", cls: "text-sky-400 border-sky-500/30 bg-sky-500/10" },
  none: { label: "—", cls: "text-muted-foreground/50 border-transparent" },
};
function CovPill({ c }: { c: Cov }) {
  const m = COV_META[c];
  if (c === "none") return <span className="text-muted-foreground/40">—</span>;
  return <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", m.cls)}><span className="h-1 w-1 rounded-full bg-current" />{m.label}</span>;
}

const FRAMEWORKS = [
  { abbr: "SOC2", name: "SOC 2", state: "Active", active: true },
  { abbr: "ISO", name: "ISO 27001", state: "Enabled" },
  { abbr: "GDPR", name: "GDPR", state: "Enabled" },
  { abbr: "HIPAA", name: "HIPAA", state: "Enabled" },
  { abbr: "HT", name: "HITRUST", state: "Enabled" },
  { abbr: "PCI", name: "PCI DSS", state: "Enabled" },
  { abbr: "CMMC", name: "CMMC", state: "Available" },
  { abbr: "FR", name: "FedRAMP", state: "Available" },
];

const FW_COLS = ["SOC 2", "ISO 27001", "GDPR", "HIPAA", "PCI DSS"];
interface Mapping {
  id: string; finding: string; controls: string;
  cov: Cov[]; status: string; band: "high" | "medium";
}
const MAPPINGS: Mapping[] = [
  { id: "F-001", finding: "Customer PII in support prompts", controls: "CC6.1, CC6.6", cov: ["covered", "partial", "missing", "partial", "none"], status: "High", band: "high" },
  { id: "F-002", finding: "Unrestricted access to CRM records", controls: "CC6.2, A.9.1", cov: ["partial", "covered", "covered", "partial", "missing"], status: "High", band: "high" },
  { id: "F-003", finding: "Third-party data sharing lacks controls", controls: "CC3.2, A.15.1", cov: ["missing", "partial", "partial", "missing", "partial"], status: "Medium", band: "medium" },
  { id: "F-004", finding: "Inadequate model change logging", controls: "CC7.2, A.12.4", cov: ["covered", "covered", "partial", "none", "none"], status: "Medium", band: "medium" },
  { id: "F-005", finding: "Prompt injection vulnerability", controls: "CC6.6, A.14.2", cov: ["partial", "partial", "missing", "none", "covered"], status: "High", band: "high" },
  { id: "F-006", finding: "Data retention beyond policy", controls: "CC8.1, A.11.2", cov: ["missing", "covered", "partial", "partial", "none"], status: "Medium", band: "medium" },
  { id: "F-007", finding: "Insufficient vendor due diligence", controls: "CC9.1, A.15.2", cov: ["partial", "covered", "partial", "missing", "partial"], status: "Medium", band: "medium" },
  { id: "F-008", finding: "Model output monitoring gaps", controls: "CC7.3, A.12.6", cov: ["covered", "partial", "none", "none", "none"], status: "review", band: "medium" },
];

const READINESS = [
  { label: "Covered", value: 120, cls: "bg-emerald-400", text: "text-emerald-400" },
  { label: "Partial", value: 42, cls: "bg-amber-400", text: "text-amber-400" },
  { label: "Missing", value: 18, cls: "bg-sev-high", text: "text-sev-high" },
  { label: "Not Applicable", value: 5, cls: "bg-muted-foreground/50", text: "text-muted-foreground" },
];

const GAPS = [
  { id: "CC6.1", name: "Access controls for sensitive data" },
  { id: "CC7.2", name: "System monitoring and logging" },
  { id: "CC8.1", name: "Data retention and disposal" },
  { id: "CC9.1", name: "Third-party risk management" },
];

const REQUIRED = [
  { name: "Access control policy", state: "missing" as Cov },
  { name: "Model monitoring procedures", state: "partial" as Cov },
  { name: "Data retention policy", state: "missing" as Cov },
  { name: "Vendor due diligence records", state: "partial" as Cov },
];

const ENVS = [
  { env: "Production", systems: 8, on: [true, true, true, true, true, false, false] },
  { env: "Staging", systems: 3, on: [true, true, false, false, false, false, false] },
  { env: "Development", systems: 5, on: [false, false, false, false, false, false, false] },
];
const ENV_COLS = ["SOC 2", "ISO 27001", "GDPR", "HIPAA", "PCI DSS", "CMMC", "FedRAMP"];

const AUDIT = [
  { title: "Evidence uploaded: access_control_policy.pdf", when: "2 hours ago" },
  { title: "Control CC6.1 marked as Covered", when: "4 hours ago" },
  { title: "SOC 2 readiness increased to 78%", when: "6 hours ago" },
  { title: "New finding F-008 requires review", when: "1 day ago" },
  { title: "ISO 27001 control A.12.4 marked as Partial", when: "1 day ago" },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={cn("inline-flex h-4 w-7 items-center rounded-full p-0.5 transition-colors", on ? "bg-emerald-500/70" : "bg-surface-2")}>
      <span className={cn("h-3 w-3 rounded-full bg-white transition-transform", on && "translate-x-3")} />
    </span>
  );
}

function ReadinessDonut() {
  const total = READINESS.reduce((s, r) => s + r.value, 0);
  const pct = 78;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative h-[140px] w-[140px] shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(40 20% 30% / 0.35)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--gold))" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} style={{ filter: "drop-shadow(0 0 6px hsl(44 88% 62% / 0.6))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="athena-figure text-[26px] font-semibold text-foreground">{pct}%</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ready</span>
      </div>
      <span className="sr-only">{total} controls</span>
    </div>
  );
}

export default function Compliance() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Compliance"
        subtitle="Turn AI risk management into audit readiness. Map controls, collect evidence, and demonstrate trust."
        background="owl-seal"
        verbs={["Trust", "Govern", "Demonstrate", "Advance"]}
      />
      <Divider variant="key" className="mt-5" />

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard layout="tile" label="Frameworks Enabled" value={8} icon={Layers} />
        <StatCard layout="tile" label="Controls Mapped" value={247} icon={FileText} />
        <StatCard layout="tile" label="Open Gaps" value={23} icon={AlertTriangle} accent="var(--sev-high)" delta={{ value: "5", direction: "up", good: false }} />
        <StatCard layout="tile" label="Evidence Ready" value={186} icon={FileCheck2} delta={{ value: "12", direction: "up", good: true }} />
        <StatCard layout="tile" label="Systems in Scope" value={12} icon={Box} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* frameworks */}
          <GlassCard hover={false}>
            <p className="athena-label">Compliance Frameworks</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Select a framework to view control coverage, gaps, and evidence requirements.</p>
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-8">
              {FRAMEWORKS.map((f) => (
                <Badge key={f.name} abbr={f.abbr} name={f.name} state={f.state} active={f.active} />
              ))}
            </div>
          </GlassCard>

          {/* control mapping */}
          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
              <div>
                <p className="athena-label">Control Mapping</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Map findings to compliance controls across frameworks.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-1.5 text-[12px] text-muted-foreground md:flex"><Search className="h-3.5 w-3.5" /> Search…</span>
                <button className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground"><Download className="h-3.5 w-3.5" /> Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Finding</th>
                    <th className="px-3 py-2 font-medium">Control(s)</th>
                    {FW_COLS.map((f) => <th key={f} className="px-3 py-2 font-medium">{f}</th>)}
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MAPPINGS.map((m) => (
                    <tr key={m.id} className="border-t border-border/40 hover:bg-surface-1/40">
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{m.id}</td>
                      <td className="px-3 py-2.5 text-[12px] text-foreground">{m.finding}</td>
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{m.controls}</td>
                      {m.cov.map((c, i) => <td key={i} className="px-3 py-2.5"><CovPill c={c} /></td>)}
                      <td className="px-3 py-2.5">
                        <span className={cn("text-[12px] font-medium", m.band === "high" ? "text-sev-high" : m.status === "review" ? "text-sky-400" : "text-sev-medium")}>
                          {m.status === "review" ? <CovPill c="review" /> : m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* customer environments */}
          <GlassCard hover={false}>
            <p className="athena-label">Customer Environments</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Define which frameworks apply to each customer environment.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                    <th className="px-3 py-2 font-medium">Environment</th>
                    <th className="px-3 py-2 font-medium">Systems</th>
                    {ENV_COLS.map((f) => <th key={f} className="px-3 py-2 text-center font-medium">{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {ENVS.map((e) => (
                    <tr key={e.env} className="border-t border-border/40">
                      <td className="px-3 py-3 text-[12px] text-foreground">{e.env}</td>
                      <td className="px-3 py-3 text-[12px] text-muted-foreground">{e.systems}</td>
                      {e.on.map((v, i) => <td key={i} className="px-3 py-3 text-center"><Toggle on={v} /></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* right rail */}
        <div className="space-y-5">
          <GlassCard hover={false} ruling>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">SOC 2 Readiness</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span>
            </div>
            <div className="flex items-center gap-4">
              <ReadinessDonut />
              <ul className="flex-1 space-y-1.5">
                {READINESS.map((r) => (
                  <li key={r.label} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("h-2 w-2 rounded-full", r.cls)} />
                    <span className="font-semibold text-foreground">{r.value}</span>
                    <span className="text-muted-foreground">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2 text-[12px] font-medium text-foreground hover:border-primary/50">View Full Framework <ChevronRight className="h-3.5 w-3.5" /></button>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-2 flex items-center justify-between">
              <p className="athena-label">High-Priority Control Gaps</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">See all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-2.5">
              {GAPS.map((g) => (
                <li key={g.id} className="flex items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-sev-high" />
                  <span className="text-[12px] font-medium text-foreground">{g.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">{g.name}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-2 flex items-center justify-between">
              <p className="athena-label">Required Evidence <span className="text-muted-foreground">(12)</span></p>
              <span className="flex items-center gap-1 text-[11px] text-gold">See all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-2.5">
              {REQUIRED.map((r) => (
                <li key={r.name} className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{r.name}</span>
                  <CovPill c={r.state} />
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Recent Audit Activity</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-3">
              {AUDIT.map((a) => (
                <li key={a.title} className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="min-w-0 flex-1 text-[12px] leading-tight text-foreground">{a.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/70">{a.when}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
