/**
 * Risks: every open risk across the estate, weighed and ranked before it turns
 * into a real-world problem. A severity heatmap by category, the register
 * itself, and -- in the rail -- Athena's read on the risk in focus, its likely
 * ripple effects, and how far remediation has got. Fixture data throughout.
 */
import {
  AlertTriangle,
  Flame,
  TriangleAlert,
  BarChart3,
  Gauge,
  ChevronRight,
  MoreHorizontal,
  X,
  ShieldAlert,
  Radio,
  Share2,
  UserX,
} from "lucide-react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { SeverityPill, StatusPill, type Severity, type StatusTone } from "@/components/mythos/atoms";
import owlMedallion from "@assets/mythos/owl-medallion.webp";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Severity", value: "All severities" },
  { label: "Status", value: "Open" },
  { label: "Environment", value: "All environments" },
  { label: "Category", value: "All categories" },
  { label: "Project", value: "All projects" },
];

const CATEGORIES = [
  { name: "Data Exposure", cells: [3, 4, 5, 2], total: 14 },
  { name: "Excessive Access", cells: [1, 4, 3, 1], total: 9 },
  { name: "Provider Risk", cells: [0, 2, 3, 1], total: 6 },
  { name: "Knowledge Integrity", cells: [0, 1, 2, 1], total: 4 },
  { name: "Lifecycle Risk", cells: [0, 2, 2, 1], total: 5 },
  { name: "Action Boundary", cells: [0, 1, 1, 1], total: 3 },
];
const SEV_COLS = ["Critical", "High", "Medium", "Low"];
const SEV_HUE = ["--sev-critical", "--sev-high", "--sev-medium", "--sev-low"];

const DONUT = [
  { label: "Data Exposure", value: 9, color: "hsl(var(--gold))" },
  { label: "Excessive Access", value: 6, color: "hsl(var(--sev-high))" },
  { label: "Provider Risk", value: 3, color: "hsl(var(--sev-medium))" },
  { label: "Knowledge Integrity", value: 2, color: "hsl(210 80% 60%)" },
  { label: "Lifecycle Risk", value: 2, color: "hsl(var(--accent-violet))" },
  { label: "Action Boundary", value: 1, color: "hsl(0 0% 55%)" },
];

interface Risk {
  n: number; sev: Severity; finding: string; category: string;
  system: string; impact: "High" | "Medium" | "Low"; conf: number;
  owner: string; status: { label: string; tone: StatusTone };
}
const REGISTER: Risk[] = [
  { n: 1, sev: "critical", finding: "Customer PII in support prompts", category: "Data Exposure", system: "Customer Support Agent", impact: "High", conf: 92, owner: "A. Chen", status: { label: "Open", tone: "review" } },
  { n: 2, sev: "critical", finding: "Unrestricted access to CRM records", category: "Excessive Access", system: "CRM Integration", impact: "High", conf: 88, owner: "M. Patel", status: { label: "Open", tone: "review" } },
  { n: 3, sev: "critical", finding: "Outbound data to unapproved provider", category: "Provider Risk", system: "Third-Party LLM (OpenAI)", impact: "High", conf: 85, owner: "S. Kim", status: { label: "Open", tone: "review" } },
  { n: 4, sev: "high", finding: "Potential data retention beyond policy", category: "Lifecycle Risk", system: "Vector Database", impact: "Medium", conf: 78, owner: "T. Brooks", status: { label: "Open", tone: "review" } },
  { n: 5, sev: "high", finding: "Inadequate output guardrails", category: "Action Boundary", system: "Customer Support Agent", impact: "Medium", conf: 80, owner: "L. Garcia", status: { label: "In Progress", tone: "progress" } },
  { n: 6, sev: "high", finding: "Sensitive data in training dataset", category: "Knowledge Integrity", system: "Fine-tuning Pipeline", impact: "Medium", conf: 76, owner: "D. Park", status: { label: "Open", tone: "review" } },
  { n: 7, sev: "medium", finding: "Over-privileged service account", category: "Excessive Access", system: "ML Ops Pipeline", impact: "Medium", conf: 73, owner: "R. Singh", status: { label: "Open", tone: "review" } },
  { n: 8, sev: "medium", finding: "Missing AI usage disclosure", category: "Compliance", system: "Web App", impact: "Low", conf: 70, owner: "E. Torres", status: { label: "In Progress", tone: "progress" } },
];

const RIPPLE = [
  { icon: ShieldAlert, text: "Exposure of additional customer PII across connected systems" },
  { icon: Radio, text: "Potential regulatory investigation (PCI, GLBA, GDPR)" },
  { icon: Share2, text: "Increased attack surface for adversarial data extraction" },
  { icon: UserX, text: "Reputational damage and customer churn" },
];

const REMEDIATION = [
  { label: "Resolved", value: 8, cls: "bg-emerald-400" },
  { label: "In progress", value: 3, cls: "bg-sky-400" },
  { label: "Open", value: 12, cls: "bg-muted-foreground/50" },
];

const ACTIVITY = [
  { tone: "emerald", title: "Remediation plan created", note: "Customer PII in support prompts", when: "2 hours ago" },
  { tone: "sky", title: "Owner assigned", note: "Unrestricted CRM access", when: "5 hours ago" },
  { tone: "amber", title: "Risk status updated", note: "Inadequate output guardrails", when: "1 day ago" },
  { tone: "muted", title: "Evidence collected", note: "Sensitive data in training dataset", when: "1 day ago" },
];

function HeatCell({ hue, count }: { hue: string; count: number }) {
  if (count === 0) return <td className="border border-border/30 px-3 py-2.5 text-center text-[12px] text-muted-foreground/40">0</td>;
  const alpha = 0.2 + Math.min(count, 5) / 5 * 0.55;
  return (
    <td className="border border-border/30 px-3 py-2.5 text-center text-[12px] font-semibold text-foreground" style={{ background: `hsl(var(${hue}) / ${alpha})` }}>{count}</td>
  );
}

function Donut({ segments, center, sub }: { segments: { value: number; color: string }[]; center: string; sub: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative h-[150px] w-[150px] shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(40 20% 30% / 0.25)" strokeWidth="14" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="athena-figure text-[24px] font-semibold text-foreground">{center}</span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-foreground">
        {value}<ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
      </span>
    </label>
  );
}

export default function Risks() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Risks"
        subtitle="Discover, prioritize, and remediate AI risks before they become real-world problems."
        background="storm"
        verbs={["Analyze", "Evidence", "Mitigate", "Strengthen"]}
      />
      <Divider variant="astrolabe" className="mt-5" />

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Open Risks" value={23} icon={AlertTriangle} delta={{ value: "28%", direction: "down", good: true, note: "vs. last 30 days" }} />
        <StatCard label="Critical Risks" value={4} icon={Flame} accent="var(--sev-critical)" delta={{ value: "60%", direction: "down", good: true, note: "vs. last 30 days" }} />
        <StatCard label="High Risks" value={7} icon={TriangleAlert} accent="var(--sev-high)" delta={{ value: "22%", direction: "down", good: true, note: "vs. last 30 days" }} />
        <StatCard label="Risk Trend" value="↓35%" icon={BarChart3} sublabel="open risks in last 30 days" />
        <StatCard label="Average Confidence" value="87%" icon={Gauge} delta={{ value: "6%", direction: "up", good: true, note: "vs. last 30 days" }} />
      </div>

      {/* filters */}
      <GlassCard hover={false} className="mt-5" bodyClassName="flex flex-wrap items-end gap-4">
        {FILTERS.map((f) => <Select key={f.label} {...f} />)}
        <button className="flex items-center gap-1.5 pb-2 text-[12px] font-medium text-gold hover:text-primary"><X className="h-3.5 w-3.5" /> Clear filters</button>
      </GlassCard>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* heatmap + donut */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GlassCard hover={false}>
              <p className="athena-label mb-3">Risks by Category and Severity</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
                      <th className="px-2 py-1.5 font-medium"></th>
                      {SEV_COLS.map((s) => <th key={s} className="px-2 py-1.5 text-center font-medium">{s}</th>)}
                      <th className="px-2 py-1.5 text-center font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((c) => (
                      <tr key={c.name}>
                        <td className="whitespace-nowrap px-2 py-2.5 text-[12px] text-foreground">{c.name}</td>
                        {c.cells.map((n, i) => <HeatCell key={i} hue={SEV_HUE[i]} count={n} />)}
                        <td className="border border-border/30 px-2 py-2.5 text-center text-[12px] font-semibold text-foreground">{c.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <p className="athena-label mb-3">Open Risks by Category</p>
              <div className="flex items-center gap-4">
                <Donut segments={DONUT} center="23" sub="Open Risks" />
                <ul className="flex-1 space-y-1.5">
                  {DONUT.map((d) => (
                    <li key={d.label} className="flex items-center gap-2 text-[12px]">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.label}</span>
                      <span className="font-semibold text-foreground">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </div>

          {/* register */}
          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <p className="athena-label">Risk Register <span className="text-muted-foreground">(23)</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                    {["", "#", "Severity", "Finding", "Category", "Affected System", "Impact", "Confidence", "Owner", "Status", ""].map((h, i) => (
                      <th key={i} className="px-3 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REGISTER.map((r) => (
                    <tr key={r.n} className="border-t border-border/40 hover:bg-surface-1/40">
                      <td className="px-3 py-2.5"><span className="block h-3.5 w-3.5 rounded border border-border/70" /></td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.n}</td>
                      <td className="px-3 py-2.5"><SeverityPill severity={r.sev} /></td>
                      <td className="px-3 py-2.5 text-[12px] text-foreground">{r.finding}</td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.category}</td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.system}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("text-[12px] font-medium", r.impact === "High" ? "text-sev-high" : r.impact === "Medium" ? "text-sev-medium" : "text-sky-400")}>{r.impact}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.conf}%</td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.owner}</td>
                      <td className="px-3 py-2.5"><StatusPill tone={r.status.tone}>{r.status.label}</StatusPill></td>
                      <td className="px-3 py-2.5 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></td>
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
              <p className="athena-label">Athena Reasoning</p>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-primary"><span className="athena-live h-1.5 w-1.5 rounded-full bg-primary" /> Live</span>
            </div>
            <div className="flex gap-3">
              <img src={owlMedallion} alt="" aria-hidden="true" className="h-9 w-9 shrink-0 select-none object-contain" />
              <p className="font-serif text-[13px] italic text-foreground">"This risk could expose sensitive customer data and erode trust. It requires immediate attention."</p>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              This finding indicates unrestricted access to customer records through an AI integration. If unresolved, it could lead to data breaches, regulatory penalties, and loss of customer trust.
            </p>
          </GlassCard>

          <GlassCard hover={false}>
            <p className="athena-label mb-3">Likely Ripple Effects</p>
            <ul className="space-y-3">
              {RIPPLE.map((r) => {
                const Icon = r.icon;
                return (
                  <li key={r.text} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="text-[12px] leading-snug text-muted-foreground">{r.text}</span>
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Remediation Progress</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <div className="flex items-center gap-4">
              <Donut segments={REMEDIATION.map((r) => ({ value: r.value, color: r.cls === "bg-emerald-400" ? "hsl(150 60% 55%)" : r.cls === "bg-sky-400" ? "hsl(205 80% 60%)" : "hsl(40 10% 45%)" }))} center="36%" sub="Remediated" />
              <ul className="flex-1 space-y-1.5">
                {REMEDIATION.map((r) => (
                  <li key={r.label} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("h-2 w-2 rounded-full", r.cls)} />
                    <span className="font-semibold text-foreground">{r.value}</span>
                    <span className="text-muted-foreground">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <p className="athena-label mb-3">Recent Activity</p>
            <ul className="space-y-3">
              {ACTIVITY.map((a) => (
                <li key={a.title} className="flex items-start gap-2.5">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.tone === "emerald" ? "bg-emerald-400" : a.tone === "sky" ? "bg-sky-400" : a.tone === "amber" ? "bg-amber-400" : "bg-muted-foreground/50")} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[12px] text-foreground">{a.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{a.note}</span>
                  </span>
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
