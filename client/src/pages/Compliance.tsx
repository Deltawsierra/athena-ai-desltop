/**
 * Compliance: where an engagement stands against OWASP ASVS 4.0.3, read from
 * `/api/compliance/:clientId`. Every requirement's state -- tested, failing,
 * not run, or not covered by any scanner we have -- comes from the engine's own
 * mapping. The readiness ring, the gap list and the counts are all derived from
 * that; nothing here is a placeholder framework badge.
 */
import { useQuery } from "@tanstack/react-query";
import { Layers, FileCheck2, AlertTriangle, CircleSlash, Box, ChevronRight, Search } from "lucide-react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider, Corners } from "@/components/mythos/Ornament";
import { cn } from "@/lib/utils";

type ControlState = "failing" | "tested" | "not_covered" | "not_run";
interface AsvsReq { id: string; chapter: string; section: string; cwe: string | null; l1: boolean; l2: boolean; l3: boolean }
interface ControlRow { requirement: AsvsReq; state: ControlState; findings: { type: string; severity: string | null }[]; scanners: string[]; approximate: boolean }
interface Summary { version: string; failing: number; tested: number; notRun: number; notCovered: number; total: number }
interface ComplianceView { client: { id: string; name: string }; testsConsidered: number; scannersLoaded: number | null; rows: ControlRow[]; summary: Summary }
interface ApiClient { id: string; name: string; status: string }

const STATE_META: Record<ControlState, { label: string; cls: string; dot: string }> = {
  tested: { label: "Tested", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-400" },
  failing: { label: "Failing", cls: "text-sev-high border-sev-high/30 bg-sev-high/10", dot: "bg-sev-high" },
  not_run: { label: "Not Run", cls: "text-sky-400 border-sky-500/30 bg-sky-500/10", dot: "bg-sky-400" },
  not_covered: { label: "Not Covered", cls: "text-muted-foreground/60 border-border/50", dot: "bg-muted-foreground/40" },
};
function StatePill({ s }: { s: ControlState }) {
  const m = STATE_META[s];
  return <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", m.cls)}><span className={cn("h-1 w-1 rounded-full", m.dot)} />{m.label}</span>;
}
function levels(r: AsvsReq): string {
  return [r.l1 && "L1", r.l2 && "L2", r.l3 && "L3"].filter(Boolean).join(" ") || "—";
}

function ReadinessDonut({ pct }: { pct: number }) {
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
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tested</span>
      </div>
    </div>
  );
}

export default function Compliance() {
  const { data: clients = [] } = useQuery<ApiClient[]>({ queryKey: ["/api/clients"] });
  const { data: tests = [] } = useQuery<{ clientId: string; startedAt: string; completedAt: string | null }[]>({ queryKey: ["/api/tests"] });
  // default to the most recently scanned engagement so fresh ASVS results surface
  const latestTest = tests.slice().sort((a, b) =>
    new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime(),
  )[0];
  const clientId = latestTest?.clientId ?? clients.find((c) => c.status === "active")?.id ?? clients[0]?.id ?? "";
  const { data, isLoading } = useQuery<ComplianceView>({ queryKey: [`/api/compliance/${clientId}`], enabled: clientId !== "" });

  const rows = data?.rows ?? [];
  const summary = data?.summary;
  const total = summary?.total ?? 0;
  const testedPct = total ? Math.round(((summary?.tested ?? 0) / total) * 100) : 0;

  // show the requirements that matter first: failing, then not-run, then tested
  const orderRank: Record<ControlState, number> = { failing: 0, not_run: 1, tested: 2, not_covered: 3 };
  const shown = rows.slice().sort((a, b) => orderRank[a.state] - orderRank[b.state]).slice(0, 20);
  const gaps = rows.filter((r) => r.state === "failing").slice(0, 6);

  const legend = [
    { label: "Tested", value: summary?.tested ?? 0, cls: "bg-emerald-400" },
    { label: "Failing", value: summary?.failing ?? 0, cls: "bg-sev-high" },
    { label: "Not Run", value: summary?.notRun ?? 0, cls: "bg-sky-400" },
    { label: "Not Covered", value: summary?.notCovered ?? 0, cls: "bg-muted-foreground/50" },
  ];
  const empty = !isLoading && rows.length === 0;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Compliance"
        subtitle="Turn AI risk management into audit readiness. Map controls, collect evidence, and demonstrate trust."
        background="owl-seal"
        verbs={["Trust", "Govern", "Demonstrate", "Advance"]}
      />
      <Divider variant="key" className="mt-5" />

      {/* stats -- live from the ASVS mapping */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard layout="tile" label="Controls Mapped" value={total} icon={Layers} />
        <StatCard layout="tile" label="Tested" value={summary?.tested ?? 0} icon={FileCheck2} />
        <StatCard layout="tile" label="Open Gaps" value={summary?.failing ?? 0} icon={AlertTriangle} accent="var(--sev-high)" />
        <StatCard layout="tile" label="Not Run" value={summary?.notRun ?? 0} icon={CircleSlash} />
        <StatCard layout="tile" label="Tests Considered" value={data?.testsConsidered ?? 0} icon={Box} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="athena-label">Framework</p>
                <p className="mt-1 text-[13px] text-foreground">OWASP ASVS <span className="text-muted-foreground">{summary?.version ?? "4.0.3"}</span></p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {data?.scannersLoaded != null
                ? `${data.scannersLoaded} scanners loaded, bearing on the application-security verification standard.`
                : "The application-security verification standard the engine maps its findings onto."}
            </p>
          </GlassCard>

          <GlassCard hover={false} bodyClassName="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
              <div>
                <p className="athena-label">Control Mapping</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Findings mapped to ASVS requirements.</p>
              </div>
              <span className="hidden items-center gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-1.5 text-[12px] text-muted-foreground md:flex"><Search className="h-3.5 w-3.5" /> Search…</span>
            </div>
            {empty ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">{isLoading ? "Loading control mapping…" : "No control mapping yet — run a scan to populate ASVS coverage."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                      {["#", "Requirement", "Level", "State", "Findings"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.requirement.id} className="border-t border-border/40 hover:bg-surface-1/40">
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.requirement.id}</td>
                        <td className="px-4 py-2.5 text-[12px] text-foreground">{r.requirement.chapter} · {r.requirement.section}</td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{levels(r.requirement)}</td>
                        <td className="px-4 py-2.5"><StatePill s={r.state} /></td>
                        <td className="px-4 py-2.5 text-[12px] text-muted-foreground">{r.findings.length || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* right rail */}
        <div className="space-y-5">
          <GlassCard hover={false} ruling className="relative overflow-hidden">
            <Corners />
            <div className="mb-3 flex items-center justify-between">
              <p className="athena-label">Readiness</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ASVS</span>
            </div>
            <div className="flex items-center gap-4">
              <ReadinessDonut pct={testedPct} />
              <ul className="flex-1 space-y-1.5">
                {legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("h-2 w-2 rounded-full", l.cls)} />
                    <span className="font-semibold text-foreground">{l.value}</span>
                    <span className="text-muted-foreground">{l.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <p className="athena-label mb-2">High-Priority Control Gaps</p>
            {gaps.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">{isLoading ? "Loading…" : "No failing controls — nothing is currently in breach."}</p>
            ) : (
              <ul className="space-y-2.5">
                {gaps.map((g) => (
                  <li key={g.requirement.id} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-sev-high" />
                    <span className="text-[12px] font-medium text-foreground">{g.requirement.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">{g.requirement.section}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
