/**
 * Deployments: the estate of AI systems, read before trust expands. Each row is
 * a system and the state of its case -- where it runs, on whose model, how
 * sensitive its data, how ready it is to ship, and what it owes compliance.
 *
 * Every figure is fixture data shaped like the real thing, so wiring this to
 * the API is a swap of the source, not a redraw.
 */
import {
  Boxes,
  Server,
  Clock,
  PauseCircle,
  Gauge,
  MessageSquare,
  FileText,
  BookOpen,
  Scale,
  BarChart3,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider, Emblem } from "@/components/mythos/Ornament";
import { SeverityPill, StatusPill, Timeline, type TimelineStep } from "@/components/mythos/atoms";
import { cn } from "@/lib/utils";

type Sensitivity = { label: string };
interface Deployment {
  id: string;
  system: string;
  blurb: string;
  icon: typeof MessageSquare;
  env: "Production" | "Staging" | "Development";
  version: string;
  model: string;
  provider: string;
  sensitivity: Sensitivity[];
  readiness: "Deployed" | "Pending Approval" | "In Review";
  risk: number;
  riskBand: "low" | "medium" | "high";
  frameworks: string[];
  lastScan: string;
}

const ENV_DOT: Record<Deployment["env"], string> = {
  Production: "bg-emerald-400",
  Staging: "bg-sky-400",
  Development: "bg-violet",
};

const READINESS_TONE: Record<Deployment["readiness"], "complete" | "progress" | "review"> = {
  Deployed: "complete",
  "Pending Approval": "progress",
  "In Review": "review",
};

const DEPLOYMENTS: Deployment[] = [
  {
    id: "d1", system: "Customer Support Copilot",
    blurb: "AI assistant for customer inquiries and account support.",
    icon: MessageSquare, env: "Production", version: "v2.4.1",
    model: "GPT-4o", provider: "OpenAI",
    sensitivity: [{ label: "Customer Data" }, { label: "Internal" }],
    readiness: "Deployed", risk: 22, riskBand: "low",
    frameworks: ["SOC 2", "GDPR"], lastScan: "Today, 10:24 AM",
  },
  {
    id: "d2", system: "Claims Review Assistant",
    blurb: "Analyzes insurance claims documents for decision support.",
    icon: FileText, env: "Staging", version: "v1.3.0",
    model: "Claude 3.5", provider: "Anthropic",
    sensitivity: [{ label: "PII" }, { label: "Financial" }],
    readiness: "Pending Approval", risk: 78, riskBand: "high",
    frameworks: ["SOX", "HIPAA"], lastScan: "Today, 9:12 AM",
  },
  {
    id: "d3", system: "Internal Knowledge Agent",
    blurb: "Searches internal documentation and company knowledge base.",
    icon: BookOpen, env: "Production", version: "v1.8.2",
    model: "GPT-4o", provider: "OpenAI",
    sensitivity: [{ label: "Internal" }, { label: "Employee Data" }],
    readiness: "Deployed", risk: 28, riskBand: "low",
    frameworks: ["SOC 2"], lastScan: "Today, 8:41 AM",
  },
  {
    id: "d4", system: "Legal Drafting Assistant",
    blurb: "Helps create and review legal documents and contracts.",
    icon: Scale, env: "Development", version: "v0.9.1",
    model: "Claude 3.5", provider: "Anthropic",
    sensitivity: [{ label: "Confidential" }, { label: "Legal" }],
    readiness: "In Review", risk: 56, riskBand: "medium",
    frameworks: ["SOC 2", "Legal Hold"], lastScan: "Yesterday, 4:17 PM",
  },
  {
    id: "d5", system: "Sales Copilot",
    blurb: "Assists sales teams with account research and outreach.",
    icon: BarChart3, env: "Production", version: "v1.5.0",
    model: "Llama 3.1", provider: "Meta",
    sensitivity: [{ label: "Customer Data" }, { label: "Internal" }],
    readiness: "Deployed", risk: 31, riskBand: "low",
    frameworks: ["GDPR"], lastScan: "Today, 11:03 AM",
  },
];

const READINESS_STEPS: TimelineStep[] = [
  { title: "Discover", detail: "Identify system, use case, and data flows.", state: "done" },
  { title: "Scan", detail: "Analyze risks, test behavior, find gaps.", state: "done" },
  { title: "Review Evidence", detail: "Validate findings and mitigation plans.", state: "active" },
  { title: "Human Approval", detail: "Security, legal, and business sign-off.", state: "todo" },
  { title: "Deploy", detail: "Release with monitoring and guardrails.", state: "todo" },
];

const HIGHEST_RISK = [
  { score: 78, name: "Claims Review Assistant", note: "Financial data exposure" },
  { score: 66, name: "Marketing Content Generator", note: "Potential policy violations" },
  { score: 61, name: "HR Screening Assistant", note: "Sensitive employee data" },
];

const ACTIVITY = [
  { tone: "emerald", title: "Deployment completed", note: "Sales Copilot to Production", when: "2 hours ago" },
  { tone: "amber", title: "Approval requested", note: "Claims Review Assistant v1.3.0", when: "4 hours ago" },
  { tone: "sky", title: "Evidence package updated", note: "Legal Drafting Assistant", when: "6 hours ago" },
  { tone: "emerald", title: "Scan completed", note: "Internal Knowledge Agent", when: "8 hours ago" },
  { tone: "amber", title: "Deployment paused", note: "Marketing Content Generator", when: "1 day ago" },
];

const FILTERS = ["All environments", "All owners", "All providers", "All statuses"];

function Select({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-foreground">
        {value}
        <ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
      </span>
    </label>
  );
}

function RiskCell({ risk, band }: { risk: number; band: Deployment["riskBand"] }) {
  const dot = band === "high" ? "bg-sev-high" : band === "medium" ? "bg-sev-medium" : "bg-emerald-400";
  const text = band === "high" ? "text-sev-high" : band === "medium" ? "text-sev-medium" : "text-emerald-400";
  const label = band === "high" ? "High" : band === "medium" ? "Medium" : "Low";
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span className="leading-tight">
        <span className={cn("block text-[12px] font-medium", text)}>{label}</span>
        <span className="block text-[11px] text-muted-foreground">{risk}</span>
      </span>
    </div>
  );
}

export default function Deployments() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Deployments"
        subtitle="Review and manage AI systems before trust expands."
        background="council"
        verbs={["Scan", "Analyze", "Evidence", "Deploy"]}
      />
      <Divider variant="key" className="mt-5" />

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Deployments" value={24} icon={Boxes} delta={{ value: "33%", direction: "up", good: true, note: "vs. last 30 days" }} />
        <StatCard label="Production Systems" value={11} icon={Server} delta={{ value: "22%", direction: "up", good: true, note: "vs. last 30 days" }} />
        <StatCard label="Pending Approval" value={4} icon={Clock} delta={{ value: "20%", direction: "down", good: true, note: "vs. last 30 days" }} />
        <StatCard label="Paused Releases" value={2} icon={PauseCircle} sublabel="No change vs. last 30 days" />
        <StatCard label="Average Risk Score" value="42" icon={Gauge} delta={{ value: "18%", direction: "down", good: true, note: "vs. last 30 days" }} sublabel="out of 100" />
      </div>

      {/* filters */}
      <GlassCard hover={false} className="mt-5" bodyClassName="flex flex-wrap items-end gap-4">
        {FILTERS.map((f, i) => (
          <Select key={f} label={["Environment", "Owner", "Model Provider", "Status"][i]} value={f} />
        ))}
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Search</span>
          <span className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Search deployments…
          </span>
        </label>
        <button className="pb-2 text-[12px] font-medium text-gold hover:text-primary">Clear filters</button>
      </GlassCard>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* table */}
        <GlassCard hover={false} className="overflow-hidden" bodyClassName="p-0">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <p className="athena-label">AI Deployments</p>
            <span className="text-[11px] text-muted-foreground">5 of 24</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  {["System", "Environment", "Model", "Data Sensitivity", "Readiness", "Risk", "Compliance", "Last Scan", ""].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPLOYMENTS.map((d) => {
                  const Icon = d.icon;
                  return (
                    <tr key={d.id} className="border-t border-border/40 align-top hover:bg-surface-1/40">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-dim/40 bg-gold/5 text-gold">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="max-w-[220px]">
                            <span className="block text-[13px] font-medium text-foreground">{d.system}</span>
                            <span className="block text-[11px] leading-snug text-muted-foreground">{d.blurb}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-[12px] text-foreground">
                          <span className={cn("h-2 w-2 rounded-full", ENV_DOT[d.env])} />
                          <span className="leading-tight">
                            {d.env}
                            <span className="block text-[11px] text-muted-foreground">{d.version}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[12px] text-foreground">{d.model}</span>
                        <span className="block text-[11px] text-muted-foreground">{d.provider}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {d.sensitivity.map((s) => (
                            <span key={s.label} className="rounded-md border border-border/60 bg-surface-1/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{s.label}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={READINESS_TONE[d.readiness]}>{d.readiness}</StatusPill>
                      </td>
                      <td className="px-4 py-4"><RiskCell risk={d.risk} band={d.riskBand} /></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {d.frameworks.map((f) => (
                            <span key={f} className="rounded-md border border-border/60 bg-surface-1/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[12px] text-muted-foreground">{d.lastScan}</td>
                      <td className="px-4 py-4 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* right rail */}
        <div className="space-y-5">
          <GlassCard hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <p className="athena-label">Release Readiness</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View pipeline <ChevronRight className="h-3 w-3" /></span>
            </div>
            <Timeline steps={READINESS_STEPS} />
            <p className="mt-4 border-t border-border/40 pt-3 font-serif text-[13px] italic text-muted-foreground">
              "Trust is earned in the details before it reaches the world."
              <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-gold-dim">— Mythos</span>
            </p>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Highest Risk Deployments</p>
            </div>
            <ul className="space-y-3">
              {HIGHEST_RISK.map((h) => (
                <li key={h.name} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sev-high/40 text-[12px] font-semibold text-sev-high">{h.score}</span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[13px] text-foreground">{h.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{h.note}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
            <button className="mt-3 flex w-full items-center justify-end gap-1 text-[11px] text-gold">View all high risk <ChevronRight className="h-3 w-3" /></button>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Recent Activity</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-3">
              {ACTIVITY.map((a) => (
                <li key={a.title} className="flex items-start gap-2.5">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.tone === "emerald" ? "bg-emerald-400" : a.tone === "amber" ? "bg-amber-400" : "bg-sky-400")} />
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

      {/* footer banner */}
      <GlassCard hover={false} ruling className="mt-5" bodyClassName="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Emblem kind="markMedallion" size={40} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Control today. A safer tomorrow.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Deploy AI with confidence, backed by evidence, governed by people.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-dim to-gold px-4 py-2 text-[13px] font-semibold text-background">
          <Plus className="h-4 w-4" /> New Deployment
        </button>
      </GlassCard>
    </div>
  );
}
