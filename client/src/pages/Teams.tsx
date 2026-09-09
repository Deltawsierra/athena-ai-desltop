/**
 * Teams: the people with access, read from `/api/users`. Each member's name,
 * role, email and active state are live; the approval authority is derived
 * from the role. Columns the user table has no source for -- per-person
 * workload, assigned systems -- are left as a dash rather than invented.
 */
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  ShieldHalf,
  UserCog,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Fragment, useState } from "react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { Avatar, Timeline, StatusPill, type TimelineStep } from "@/components/mythos/atoms";
import { cn } from "@/lib/utils";

interface ApiUser { id: string; username: string; role: string; email: string | null; isActive: boolean; createdAt: string }

const TABS = ["Team Members", "Groups", "Access & Permissions"];

const ROLE_META: Record<string, { label: string; icon: typeof ShieldHalf; blurb: string; authority: string }> = {
  admin: { label: "Administrators", icon: ShieldHalf, blurb: "Full platform access and final approval authority.", authority: "Approve (Critical)" },
  user: { label: "Members", icon: Users, blurb: "Run scans, review findings, and manage evidence.", authority: "Recommend" },
};
function roleMeta(role: string) {
  return ROLE_META[role] ?? { label: role.charAt(0).toUpperCase() + role.slice(1), icon: UserCog, blurb: "Team member.", authority: "Recommend" };
}

const WORKFLOW: TimelineStep[] = [
  { title: "Athena Identifies Finding", detail: "The engine detects and analyzes potential risks.", state: "done" },
  { title: "Human Review & Remediation", detail: "Assigned to team members for analysis and remediation.", state: "active" },
  { title: "Evidence Approval", detail: "Final review and approval by authorized owners.", state: "todo" },
];

export default function Teams() {
  const { data: users = [], isLoading } = useQuery<ApiUser[]>({ queryKey: ["/api/users"] });

  const [tab, setTab] = useState(TABS[0]);
  const [search, setSearch] = useState("");
  const [roleF, setRoleF] = useState("all");

  const active = users.filter((u) => u.isActive).length;
  const admins = users.filter((u) => u.role === "admin").length;

  // group by role, in a stable order
  const order = ["admin", "user"];
  const roles = Array.from(new Set(users.map((u) => u.role))).sort(
    (a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99),
  );

  // apply the search + role filter, then group what survives
  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) =>
    (roleF === "all" || u.role === roleF) &&
    (q === "" || u.username.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)),
  );
  const filtersActive = roleF !== "all" || q !== "";
  const groups = roles
    .map((role) => ({ role, meta: roleMeta(role), members: filtered.filter((u) => u.role === role) }))
    .filter((g) => g.members.length > 0 || !filtersActive);

  const roleMatrix = roles.map((role) => ({ role: roleMeta(role).label, count: users.filter((u) => u.role === role).length }));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Teams"
        subtitle="People power a safer tomorrow. Assign, review, and approve with clarity."
        background="council"
        verbs={["People", "Ownership", "Collaboration", "Trust"]}
      />
      <Divider variant="laurel" className="mt-5" />

      {/* stats -- live from the user directory */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={users.length} icon={Users} sublabel={`Across ${roles.length} role${roles.length === 1 ? "" : "s"}`} />
        <StatCard label="Active Members" value={active} icon={UserCheck} sublabel="Can sign in and act" />
        <StatCard label="Administrators" value={admins} icon={ShieldHalf} sublabel="Full approval authority" />
        <StatCard label="Inactive" value={users.length - active} icon={UserCog} sublabel="Access suspended" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3">
              <div className="flex gap-1">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 px-2 py-1 text-[13px] font-medium transition-colors", tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
                ))}
              </div>
              {tab === "Team Members" && (
                <div className="ml-auto flex items-center gap-2">
                  <label className="hidden items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-1.5 text-[12px] text-muted-foreground md:flex">
                    <Search className="h-3.5 w-3.5" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team members…" className="w-40 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none" />
                  </label>
                  <span className="relative inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <select value={roleF} onChange={(e) => setRoleF(e.target.value)} className="cursor-pointer appearance-none bg-transparent pr-1 text-foreground focus:outline-none">
                      <option value="all">All roles</option>
                      {roles.map((r) => <option key={r} value={r}>{roleMeta(r).label}</option>)}
                    </select>
                  </span>
                  <button onClick={() => alert("Add Member — invite flow coming soon.")} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-dim to-gold px-3 py-1.5 text-[12px] font-semibold text-background"><Plus className="h-3.5 w-3.5" /> Add Member</button>
                </div>
              )}
            </div>
            {users.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">{isLoading ? "Loading team…" : "No team members found."}</p>
            ) : tab === "Team Members" ? (
              filtered.length === 0 ? (
                <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">No members match the current filter.</p>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                      {["Name", "Email", "Role", "Approval Authority", "Status", ""].map((h, i) => (
                        <th key={i} className="px-4 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => {
                      const Icon = g.meta.icon;
                      return (
                        <Fragment key={g.role}>
                          <tr className="border-t border-border/40 bg-surface-1/30">
                            <td colSpan={6} className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-gold" />
                                <span className="text-[13px] font-semibold text-foreground">{g.meta.label}</span>
                                <span className="text-[11px] text-muted-foreground">({g.members.length})</span>
                                <span className="ml-2 text-[11px] text-muted-foreground/70">{g.meta.blurb}</span>
                              </div>
                            </td>
                          </tr>
                          {g.members.map((m) => (
                            <tr key={m.id} className="border-t border-border/30 hover:bg-surface-1/40">
                              <td className="px-4 py-3"><Avatar name={m.username} size={30} /></td>
                              <td className="px-4 py-3 text-[12px] text-muted-foreground">{m.email ?? "—"}</td>
                              <td className="px-4 py-3 text-[12px] text-foreground">{m.role}</td>
                              <td className="px-4 py-3 text-[12px] text-foreground">{g.meta.authority}</td>
                              <td className="px-4 py-3">
                                {m.isActive
                                  ? <StatusPill tone="complete">Active</StatusPill>
                                  : <StatusPill tone="neutral">Inactive</StatusPill>}
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
              )
            ) : tab === "Groups" ? (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                {roles.map((role) => {
                  const meta = roleMeta(role);
                  const Icon = meta.icon;
                  const members = users.filter((u) => u.role === role);
                  return (
                    <div key={role} className="rounded-xl border border-border/50 bg-surface-1/40 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-dim/40 bg-gold/5 text-gold"><Icon className="h-4 w-4" /></span>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{meta.label}</p>
                          <p className="text-[11px] text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"} · {meta.authority}</p>
                        </div>
                      </div>
                      <p className="mt-2.5 text-[11px] text-muted-foreground/80">{meta.blurb}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {members.slice(0, 8).map((m) => <span key={m.id} title={m.username}><Avatar name={m.username} size={26} /></span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                      {["Role", "Members", "Approval Authority", "Scope"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => {
                      const meta = roleMeta(role);
                      return (
                        <tr key={role} className="border-t border-border/40 hover:bg-surface-1/40">
                          <td className="px-4 py-3 text-[13px] font-medium text-foreground">{meta.label}</td>
                          <td className="px-4 py-3 text-[12px] text-muted-foreground">{users.filter((u) => u.role === role).length}</td>
                          <td className="px-4 py-3 text-[12px] text-foreground">{meta.authority}</td>
                          <td className="px-4 py-3 text-[12px] text-muted-foreground">{meta.blurb}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
              <p className="athena-label">Role &amp; Access Matrix</p>
              <ChevronRight className="h-3.5 w-3.5 text-gold" />
            </div>
            <ul className="space-y-2.5">
              {roleMatrix.length === 0 ? (
                <li className="text-[12px] text-muted-foreground">{isLoading ? "Loading…" : "No roles defined."}</li>
              ) : roleMatrix.map((r) => (
                <li key={r.role} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="min-w-0 flex-1 text-[12px] text-foreground">{r.role}</span>
                  <span className="text-[12px] text-muted-foreground">{r.count} member{r.count === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border/40 pt-2 text-[11px] text-muted-foreground/70">
              {active === users.length ? "All members are active." : `${users.length - active} member(s) suspended.`}
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
