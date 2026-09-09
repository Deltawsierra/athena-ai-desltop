/**
 * Evidence: the record a deployment decision is actually made on. Packs, proofs,
 * unknowns, decisions -- each artifact with its system, its state, and who owns
 * it -- plus the release recommendation and the human approvals that gate it.
 *
 * Fixture data throughout, shaped like the API so the swap is the source only.
 */
import {
  Files,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ListChecks,
  Database,
  Share2,
  BarChart3,
  Download,
  MoreHorizontal,
  ChevronRight,
  SlidersHorizontal,
  Search,
  Landmark,
} from "lucide-react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { StatusPill, Avatar, Meter, type StatusTone } from "@/components/mythos/atoms";
import { cn } from "@/lib/utils";

interface Artifact {
  id: string;
  name: string;
  blurb: string;
  icon: typeof FileText;
  system: string;
  version: string;
  status: { label: string; tone: StatusTone };
  owner: string;
  dept: string;
  updated: string;
}

const ARTIFACTS: Artifact[] = [
  { id: "e1", name: "Evidence Pack", blurb: "Complete security and risk assessment", icon: FileText, system: "Customer Support Agent", version: "v2.4.1", status: { label: "Complete", tone: "complete" }, owner: "Sarah Mitchell", dept: "Security", updated: "Today, 10:24 AM" },
  { id: "e2", name: "Unknowns Register", blurb: "Identified gaps and open questions", icon: ListChecks, system: "Marketing Copilot", version: "v1.3.0", status: { label: "In Progress", tone: "progress" }, owner: "Daniel Kim", dept: "Security", updated: "Today, 9:12 AM" },
  { id: "e3", name: "Deployment Decision Record", blurb: "Go/no-go decision and rationale", icon: FileText, system: "Financial Analyst", version: "v1.1.0", status: { label: "Approved", tone: "approved" }, owner: "Carmen Lopez", dept: "Risk", updated: "Apr 22, 2025" },
  { id: "e4", name: "Remediation Approval", blurb: "Risk treatment validation", icon: CheckCircle2, system: "HR Assistant", version: "v1.0.2", status: { label: "Approved", tone: "approved" }, owner: "Robert Chen", dept: "Engineering", updated: "Apr 21, 2025" },
  { id: "e5", name: "Retest Summary", blurb: "Post-remediation validation results", icon: BarChart3, system: "Code Assistant", version: "v2.0.0", status: { label: "Passed", tone: "passed" }, owner: "Maya Patel", dept: "Security", updated: "Apr 20, 2025" },
  { id: "e6", name: "Provider Assurance Profile", blurb: "Vendor security and compliance", icon: ShieldCheck, system: "OpenAI", version: "GPT-4o", status: { label: "Complete", tone: "complete" }, owner: "James Turner", dept: "Vendor Risk", updated: "Apr 19, 2025" },
  { id: "e7", name: "Data Lifecycle Review", blurb: "Data handling and retention analysis", icon: Database, system: "Customer Support Agent", version: "v2.4.1", status: { label: "In Progress", tone: "progress" }, owner: "Alex Carter", dept: "Data Governance", updated: "Apr 18, 2025" },
  { id: "e8", name: "System Capability Map", blurb: "Capabilities, integrations, data flows", icon: Share2, system: "Marketing Copilot", version: "v1.3.0", status: { label: "Complete", tone: "complete" }, owner: "Sophia Park", dept: "Architecture", updated: "Apr 17, 2025" },
];

const TABS = ["All Evidence", "Evidence Packs", "Unknowns", "Decisions", "Remediations", "Retests", "Provider Info", "Data & Systems"];

const APPROVALS = [
  { role: "Security Approval", who: "Sarah Mitchell", when: "Apr 21" },
  { role: "Risk Approval", who: "Carmen Lopez", when: "Apr 21" },
  { role: "Legal Approval", who: "Priya Shah", when: "Apr 22" },
];

const COMPLETENESS = [
  { system: "Customer Support Agent", pct: 92 },
  { system: "Marketing Copilot", pct: 68 },
  { system: "Financial Analyst", pct: 100 },
  { system: "HR Assistant", pct: 85 },
  { system: "Code Assistant", pct: 78 },
];

const DOC_ACTIVITY = [
  { tone: "emerald", title: "Remediation approval added", note: "Customer Support Agent", when: "2h ago" },
  { tone: "emerald", title: "Retest summary uploaded", note: "Code Assistant", when: "5h ago" },
  { tone: "amber", title: "Unknowns register updated", note: "Marketing Copilot", when: "1d ago" },
  { tone: "emerald", title: "Decision record approved", note: "Financial Analyst", when: "1d ago" },
  { tone: "sky", title: "Provider profile updated", note: "OpenAI", when: "2d ago" },
];

export default function Evidence() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Evidence"
        subtitle="Document the truth. Enable confident decisions."
        background="library"
        verbs={["Evidence", "Proof", "Trust", "Deploys"]}
      />
      <Divider variant="laurel" className="mt-5" />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          {/* stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Evidence Packs" value={28} icon={Files} delta={{ value: "+4", direction: "up", good: true, note: "this week" }} sublabel="Complete documentation sets" />
            <StatCard label="Retest Proofs" value={14} icon={ShieldCheck} delta={{ value: "+3", direction: "up", good: true, note: "this week" }} sublabel="Validation & verification" />
            <StatCard label="Open Unknowns" value={6} icon={AlertTriangle} delta={{ value: "-4", direction: "down", good: true, note: "since last week" }} sublabel="Items requiring resolution" accent="var(--sev-medium)" />
            <StatCard label="Approved Remediations" value={19} icon={CheckCircle2} delta={{ value: "+7", direction: "up", good: true, note: "this month" }} sublabel="Risk items addressed" />
            <StatCard label="Recent Decisions" value={11} icon={FileText} delta={{ value: "+2", direction: "up", good: true, note: "this week" }} sublabel="Go / No-go recorded" />
          </div>

          {/* tabs + table */}
          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-3">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-1.5 text-[12px] text-muted-foreground sm:flex">
                  <Search className="h-3.5 w-3.5" /> Search evidence…
                </span>
                <button className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                    {["Evidence Artifact", "System", "Status", "Owner", "Last Updated", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ARTIFACTS.map((a) => {
                    const Icon = a.icon;
                    return (
                      <tr key={a.id} className="border-t border-border/40 hover:bg-surface-1/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-dim/40 bg-gold/5 text-gold">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="leading-tight">
                              <span className="block text-[13px] font-medium text-foreground">{a.name}</span>
                              <span className="block text-[11px] text-muted-foreground">{a.blurb}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-foreground">{a.system}</span>
                          <span className="block text-[11px] text-muted-foreground">{a.version}</span>
                        </td>
                        <td className="px-4 py-3"><StatusPill tone={a.status.tone}>{a.status.label}</StatusPill></td>
                        <td className="px-4 py-3"><Avatar name={a.owner} sub={a.dept} size={30} /></td>
                        <td className="px-4 py-3 text-[12px] text-muted-foreground">{a.updated}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button className="rounded-md border border-border/60 px-2.5 py-1 text-[12px] text-foreground hover:border-primary/50">View</button>
                            <button className="rounded-md border border-border/60 p-1.5 text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
                            <button className="p-1 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* footer banner */}
          <GlassCard hover={false} ruling bodyClassName="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-dim/40 text-gold"><Landmark className="h-5 w-5" /></span>
              <div>
                <p className="font-serif text-[18px] text-foreground">From evidence to confidence.</p>
                <p className="text-[13px] text-muted-foreground">Clear documentation. Measurable progress. Safer AI for what's next.</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold">Turn evidence into opportunity <ChevronRight className="h-4 w-4" /></button>
          </GlassCard>
        </div>

        {/* right rail */}
        <div className="space-y-5">
          <GlassCard hover={false} ruling>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Release Recommendation</p>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Beta Ready</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_16px_hsl(150_60%_45%/0.3)]">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Customer Support Agent <span className="text-muted-foreground">v2.4.1</span></p>
                <p className="mt-1 text-[12px] text-muted-foreground">Based on current evidence, this deployment is ready for controlled release.</p>
              </div>
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2 text-[12px] font-medium text-foreground hover:border-primary/50">
              View Full Decision Record <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-2 flex items-center justify-between">
              <p className="athena-label">Human Approvals</p>
              <StatusPill tone="complete">Complete</StatusPill>
            </div>
            <p className="flex items-baseline gap-2">
              <span className="athena-figure text-[30px] font-semibold text-foreground">3 / 3</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Required approvals obtained</p>
            <ul className="mt-3 space-y-2.5 border-t border-border/40 pt-3">
              {APPROVALS.map((a) => (
                <li key={a.role} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="min-w-0 flex-1 text-[12px] text-foreground">{a.role}</span>
                  <span className="text-[11px] text-muted-foreground">{a.who}</span>
                  <span className="w-10 text-right text-[11px] text-muted-foreground/70">{a.when}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard hover={false}>
            <p className="athena-label mb-3">Evidence Completeness by System</p>
            <ul className="space-y-2.5">
              {COMPLETENESS.map((c) => (
                <li key={c.system}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-foreground">{c.system}</span>
                    <span className="text-muted-foreground">{c.pct}%</span>
                  </div>
                  <Meter percent={c.pct} tone="gold" />
                </li>
              ))}
            </ul>
            <button className="mt-3 flex w-full items-center justify-end gap-1 text-[11px] text-gold">View all systems <ChevronRight className="h-3 w-3" /></button>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Recent Document Activity</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View all activity <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-3">
              {DOC_ACTIVITY.map((d) => (
                <li key={d.title} className="flex items-start gap-2.5">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", d.tone === "emerald" ? "bg-emerald-400" : d.tone === "amber" ? "bg-amber-400" : "bg-sky-400")} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[12px] text-foreground">{d.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{d.note}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/70">{d.when}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
