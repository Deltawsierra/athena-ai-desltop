/**
 * Teams: the people the whole model turns on. Who owns which systems, how much
 * review sits on each of them, what each is authorised to approve, and the
 * workflow that carries a finding from Athena to a signed decision.
 * Fixture data, shaped like the API.
 */
import {
  Users,
  Clock,
  FileText,
  CheckCircle2,
  ShieldHalf,
  Code2,
  ScrollText,
  Crown,
  Settings as Cog,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Fragment } from "react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { Avatar, Timeline, type TimelineStep } from "@/components/mythos/atoms";
import { cn } from "@/lib/utils";

interface Member {
  name: string; role: string; systems: string; findings: number;
  load: number; authority: string; when: string; activity: string; dot: string;
}
interface Group {
  name: string; icon: typeof ShieldHalf; count: number; blurb: string; members: Member[];
}
const GROUPS: Group[] = [
  {
    name: "Security", icon: ShieldHalf, count: 8, blurb: "Find, assess, and mitigate AI security risks.",
    members: [
      { name: "Alex Chen", role: "Security Analyst", systems: "8 systems", findings: 12, load: 85, authority: "Recommend", when: "2h ago", activity: "Reviewed finding #8421", dot: "bg-amber-400" },
      { name: "Maya Patel", role: "Security Engineer", systems: "6 systems", findings: 8, load: 55, authority: "Approve (Low)", when: "4h ago", activity: "Assigned to remediation", dot: "bg-emerald-400" },
      { name: "Daniel Kim", role: "AppSec Lead", systems: "12 systems", findings: 5, load: 35, authority: "Approve (Medium)", when: "1h ago", activity: "Approved evidence #7710", dot: "bg-emerald-400" },
    ],
  },
  {
    name: "Engineering", icon: Code2, count: 12, blurb: "Build securely. Remediate with speed.",
    members: [
      { name: "Sarah Mitchell", role: "Senior Engineer", systems: "10 systems", findings: 14, load: 92, authority: "Implement", when: "3h ago", activity: "Updated remediation plan", dot: "bg-emerald-400" },
      { name: "James Park", role: "Backend Engineer", systems: "7 systems", findings: 6, load: 48, authority: "Implement", when: "5h ago", activity: "Marked finding in progress", dot: "bg-amber-400" },
      { name: "Elena Rodriguez", role: "ML Engineer", systems: "5 systems", findings: 4, load: 32, authority: "Implement", when: "1d ago", activity: "Added evidence", dot: "bg-emerald-400" },
    ],
  },
  {
    name: "Compliance", icon: ScrollText, count: 7, blurb: "Ensure governance, policy, and regulatory alignment.",
    members: [
      { name: "Priya Desai", role: "Compliance Analyst", systems: "9 systems", findings: 9, load: 62, authority: "Approve (Medium)", when: "2h ago", activity: "Reviewed control mapping", dot: "bg-amber-400" },
      { name: "Marcus Bell", role: "GRC Manager", systems: "11 systems", findings: 6, load: 44, authority: "Approve (High)", when: "6h ago", activity: "Approved evidence #7682", dot: "bg-emerald-400" },
    ],
  },
  {
    name: "Executive Review", icon: Crown, count: 4, blurb: "Strategic oversight and risk acceptance.",
    members: [
      { name: "Jonathan Reed", role: "CISO", systems: "All systems", findings: 3, load: 22, authority: "Approve (Critical)", when: "1h ago", activity: "Approved risk exception", dot: "bg-emerald-400" },
    ],
  },
  {
    name: "Platform Admins", icon: Cog, count: 4, blurb: "Manage platform access, integrations, and settings.",
    members: [
      { name: "Taylor Brooks", role: "Platform Admin", systems: "All systems", findings: 2, load: 18, authority: "Full Access", when: "3h ago", activity: "Updated user permissions", dot: "bg-emerald-400" },
    ],
  },
];

const TABS = ["Team Members", "Groups", "Access & Permissions"];

const WORKFLOW: TimelineStep[] = [
  { title: "Athena Identifies Finding", detail: "AI detects and analyzes potential risks.", state: "done" },
  { title: "Human Review & Remediation", detail: "Assigned to team members for analysis and remediation.", state: "active" },
  { title: "Evidence Approval", detail: "Final review and approval by authorized owners.", state: "todo" },
];

const REVIEWERS = [
  { name: "Maya Patel", action: "Approved evidence #7710", tone: "emerald", when: "1h ago" },
  { name: "Alex Chen", action: "Commented on finding #8421", tone: "sky", when: "2h ago" },
  { name: "Sarah Mitchell", action: "Requested additional info", tone: "amber", when: "3h ago" },
  { name: "Marcus Bell", action: "Approved control mapping", tone: "emerald", when: "6h ago" },
  { name: "Daniel Kim", action: "Reassigned to Engineering", tone: "sky", when: "8h ago" },
];

const OWNERSHIP = [
  { project: "Customer Support Agent", n: 12, pct: 100 },
  { project: "Internal Knowledge Base", n: 9, pct: 75 },
  { project: "Risk Analysis Engine", n: 7, pct: 58 },
  { project: "Code Assistant", n: 6, pct: 50 },
  { project: "Marketing Content Gen", n: 4, pct: 33 },
];

const ROLE_MATRIX = [
  { role: "Security", staffed: "5/5" },
  { role: "Engineering", staffed: "5/5" },
  { role: "Compliance", staffed: "4/4" },
  { role: "Executive", staffed: "3/3" },
  { role: "Platform Admins", staffed: "3/3" },
];

function WorkloadBar({ findings, load }: { findings: number; load: number }) {
  const cls = load >= 80 ? "bg-sev-high" : load >= 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[12px] text-muted-foreground">{findings} findings</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
        <span className={cn("block h-full rounded-full", cls)} style={{ width: `${load}%` }} />
      </span>
    </div>
  );
}

export default function Teams() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Teams"
        subtitle="People power a safer tomorrow. Assign, review, and approve with clarity."
        background="council"
        verbs={["People", "Ownership", "Collaboration", "Trust"]}
      />
      <Divider variant="laurel" className="mt-5" />

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={42} icon={Users} delta={{ value: "12%", direction: "up", good: true }} sublabel="Across 5 teams" />
        <StatCard label="Human Reviews Pending" value={17} icon={Clock} delta={{ value: "32%", direction: "up", good: false }} sublabel="Require human analysis" />
        <StatCard label="Assigned Findings" value={86} icon={FileText} delta={{ value: "18%", direction: "down", good: true }} sublabel="Across all team members" />
        <StatCard label="Approval Queues" value={9} icon={CheckCircle2} delta={{ value: "50%", direction: "up", good: false }} sublabel="Awaiting final approval" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3">
              <div className="flex gap-1">
                {TABS.map((t, i) => (
                  <button key={t} className={cn("border-b-2 px-2 py-1 text-[13px] font-medium transition-colors", i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-1.5 text-[12px] text-muted-foreground md:flex"><Search className="h-3.5 w-3.5" /> Search team members…</span>
                <button className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground"><SlidersHorizontal className="h-3.5 w-3.5" /> Filter</button>
                <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-dim to-gold px-3 py-1.5 text-[12px] font-semibold text-background"><Plus className="h-3.5 w-3.5" /> Add Member</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                    {["Name", "Role", "Assigned Systems", "Review Workload", "Approval Authority", "Recent Activity", ""].map((h, i) => (
                      <th key={i} className="px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GROUPS.map((g) => {
                    const Icon = g.icon;
                    return (
                      <Fragment key={g.name}>
                        <tr className="border-t border-border/40 bg-surface-1/30">
                          <td colSpan={7} className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gold" />
                              <span className="text-[13px] font-semibold text-foreground">{g.name}</span>
                              <span className="text-[11px] text-muted-foreground">({g.count} members)</span>
                              <span className="ml-2 text-[11px] text-muted-foreground/70">{g.blurb}</span>
                            </div>
                          </td>
                        </tr>
                        {g.members.map((m) => (
                          <tr key={m.name} className="border-t border-border/30 hover:bg-surface-1/40">
                            <td className="px-4 py-3">
                              <div className="relative">
                                <span className={cn("absolute -left-1 top-1 z-10 h-2 w-2 rounded-full ring-2 ring-background", m.dot)} />
                                <Avatar name={m.name} size={30} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-muted-foreground">{m.role}</td>
                            <td className="px-4 py-3 text-[12px] text-foreground">{m.systems}</td>
                            <td className="px-4 py-3"><WorkloadBar findings={m.findings} load={m.load} /></td>
                            <td className="px-4 py-3 text-[12px] text-foreground">{m.authority}</td>
                            <td className="px-4 py-3">
                              <span className="text-[12px] text-foreground">{m.activity}</span>
                              <span className="block text-[11px] text-muted-foreground/70">{m.when}</span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* right rail */}
        <div className="space-y-5">
          <GlassCard hover={false} ruling>
            <div className="mb-4 flex items-center justify-between">
              <p className="athena-label">Approval Workflow</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View workflow <ChevronRight className="h-3 w-3" /></span>
            </div>
            <Timeline steps={WORKFLOW} />
            <p className="mt-4 border-t border-border/40 pt-3 text-center text-[10px] uppercase tracking-[0.2em] text-gold-dim">Human judgment turns insight into impact.</p>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Recent Reviewer Actions</p>
              <span className="flex items-center gap-1 text-[11px] text-gold">View all <ChevronRight className="h-3 w-3" /></span>
            </div>
            <ul className="space-y-3">
              {REVIEWERS.map((r) => (
                <li key={r.name} className="flex items-center gap-2.5">
                  <Avatar name={r.name} size={28} />
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", r.tone === "emerald" ? "bg-emerald-400" : r.tone === "sky" ? "bg-sky-400" : "bg-amber-400")} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">{r.action}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/70">{r.when}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <GlassCard hover={false}>
              <div className="mb-3 flex items-center justify-between">
                <p className="athena-label">Ownership by Project</p>
                <span className="flex items-center gap-1 text-[11px] text-gold">View all <ChevronRight className="h-3 w-3" /></span>
              </div>
              <ul className="space-y-2.5">
                {OWNERSHIP.map((o) => (
                  <li key={o.project} className="flex items-center gap-3">
                    <span className="w-40 truncate text-[12px] text-foreground">{o.project}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-gradient-to-r from-gold-dim to-gold" style={{ width: `${o.pct}%` }} /></span>
                    <span className="w-6 text-right text-[12px] text-muted-foreground">{o.n}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="mb-3 flex items-center justify-between">
                <p className="athena-label">Role &amp; Access Matrix</p>
                <ChevronRight className="h-3.5 w-3.5 text-gold" />
              </div>
              <ul className="space-y-2.5">
                {ROLE_MATRIX.map((r) => (
                  <li key={r.role} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="min-w-0 flex-1 text-[12px] text-foreground">{r.role}</span>
                    <span className="text-[12px] text-muted-foreground">{r.staffed}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border/40 pt-2 text-[11px] text-muted-foreground/70">All critical roles are staffed.</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
