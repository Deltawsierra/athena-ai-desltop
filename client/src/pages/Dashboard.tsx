/**
 * The dashboard.
 *
 * Every figure on this page is derived from a record in the database. The
 * previous version shipped six hardcoded ticker headlines, a fake threat
 * breakdown and four invented metrics -- so a fresh install showed twenty-two
 * threats and a ninety-eight percent detection rate against an empty
 * database. That reads well for about ninety seconds, which is roughly how
 * long it takes somebody to ask what the numbers are.
 *
 * So: real counts, and an empty state that says the estate is empty. A demo
 * that admits it has no data is a demo you can put real data into on the call.
 *
 * That left one thing standing. The installer seeds three tests carrying
 * twenty-three findings, so every figure here was derived from a database row
 * and every figure was still describing an estate nobody had scanned -- the
 * same claim as before, one layer further down. The notice above the figures
 * says how many of them the installer wrote, and removes them on a click.
 */

import { Suspense, lazy, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Globe2,
  Scan,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import WebGLBoundary from "@/components/three/WebGLBoundary";
import type { FieldNode } from "@/components/three/ThreatField";

import AnimatedContainer from "@/components/AnimatedContainer";
import SampleDataNotice from "@/components/SampleDataNotice";
import type { Client, Site, Test } from "@shared/schema";

// three.js is a megabyte before gzip and only two screens use it. Loading it
// with the rest of the app would put that on the critical path of every cold
// start, including the login screen, which draws no 3D at all.
const ThreatField = lazy(() => import("@/components/three/ThreatField"));

const SEVERITIES = [
  { key: "critical", label: "Critical", token: "--sev-critical" },
  { key: "high", label: "High", token: "--sev-high" },
  { key: "medium", label: "Medium", token: "--sev-medium" },
  { key: "low", label: "Low", token: "--sev-low" },
] as const;

interface Totals {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

function sumSeverities(tests: Test[]): Totals {
  return tests.reduce<Totals>(
    (acc, test) => ({
      critical: acc.critical + (test.criticalCount ?? 0),
      high: acc.high + (test.highCount ?? 0),
      medium: acc.medium + (test.mediumCount ?? 0),
      low: acc.low + (test.lowCount ?? 0),
    }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

/** 0 when nothing was found, higher the worse it is. */
function severityWeight(totals: Totals): number {
  return totals.critical * 8 + totals.high * 4 + totals.medium * 2 + totals.low;
}

function Figure({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  testId,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Scan;
  tone?: "primary" | "critical";
  testId: string;
}) {
  const colour =
    tone === "critical" ? "hsl(var(--sev-critical))" : "hsl(var(--primary))";
  return (
    <div className="athena-panel p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="athena-label">{label}</div>
          <div
            className="athena-figure mt-2 text-4xl font-semibold"
            style={{ color: colour }}
          >
            {value}
          </div>
          {hint && (
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {hint}
            </div>
          )}
        </div>
        <div
          className="rounded-lg p-2"
          style={{
            background: `color-mix(in srgb, ${colour} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${colour} 28%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: colour }} />
        </div>
      </div>
    </div>
  );
}

function EmptyEstate() {
  return (
    <div className="athena-panel p-10 text-center" data-testid="estate-empty">
      <Globe2
        className="mx-auto mb-4 h-10 w-10"
        style={{ color: "hsl(var(--primary))", opacity: 0.7 }}
      />
      <h2 className="text-xl font-semibold">Nothing is being monitored yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Add a client and one of their sites, and this dashboard fills in from
        the tests you run against it — findings by severity, the sites they were
        found on, and the record of who ran what.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/clients"
          className="athena-label inline-flex items-center gap-2 rounded-lg px-4 py-2"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
          data-testid="link-add-client"
        >
          Add a client <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/pentest"
          className="athena-label inline-flex items-center gap-2 rounded-lg border px-4 py-2"
          style={{ borderColor: "hsl(var(--border))" }}
          data-testid="link-run-scan"
        >
          Run a scan
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const clients = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const sites = useQuery<Site[]>({ queryKey: ["/api/sites"] });
  const tests = useQuery<Test[]>({ queryKey: ["/api/tests"] });

  const loading = clients.isLoading || sites.isLoading || tests.isLoading;

  const siteList = useMemo(() => sites.data ?? [], [sites.data]);
  const testList = useMemo(() => tests.data ?? [], [tests.data]);

  const totals = useMemo(() => sumSeverities(testList), [testList]);
  const findings = totals.critical + totals.high + totals.medium + totals.low;

  /** Per site, so the globe and the bar chart agree with each other. */
  const perSite = useMemo(() => {
    const bySite = new Map<string, Test[]>();
    for (const test of testList) {
      if (!test.siteId) continue;
      const existing = bySite.get(test.siteId);
      if (existing) existing.push(test);
      else bySite.set(test.siteId, [test]);
    }
    return siteList.map((site) => {
      const siteTests = bySite.get(site.id) ?? [];
      const siteTotals = sumSeverities(siteTests);
      return {
        site,
        totals: siteTotals,
        weight: severityWeight(siteTotals),
        tests: siteTests.length,
      };
    });
  }, [siteList, testList]);

  const worst = useMemo(
    () => perSite.reduce((max, entry) => Math.max(max, entry.weight), 0),
    [perSite],
  );

  const nodes: FieldNode[] = useMemo(
    () =>
      perSite.map(({ site, weight }) => ({
        id: site.id,
        label: site.name,
        // Normalised against the worst site, so the globe shows relative risk
        // across this estate rather than an absolute scale nobody calibrated.
        severity: worst > 0 ? Math.min(1, weight / worst) : 0,
      })),
    [perSite, worst],
  );

  const breakdown = useMemo(
    () =>
      SEVERITIES.map(({ key, label, token }) => ({
        name: label,
        value: totals[key],
        colour: `hsl(var(${token}))`,
      })).filter((slice) => slice.value > 0),
    [totals],
  );

  const topSites = useMemo(
    () =>
      [...perSite]
        .filter((entry) => entry.weight > 0)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6)
        .map((entry) => ({
          name: entry.site.name,
          critical: entry.totals.critical,
          high: entry.totals.high,
          medium: entry.totals.medium,
          low: entry.totals.low,
        })),
    [perSite],
  );

  const alert = totals.critical > 0;
  const nothingYet = !loading && siteList.length === 0 && testList.length === 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        <AnimatedContainer direction="up" delay={0}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="athena-label mb-2 flex items-center gap-2">
                <span
                  className="athena-live inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: alert
                      ? "hsl(var(--sev-critical))"
                      : "hsl(var(--primary))",
                  }}
                />
                {alert ? "Attention required" : "Estate nominal"}
              </div>
              <motion.h1
                className="text-3xl font-semibold tracking-tight md:text-4xl"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Athena
              </motion.h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? "Reading the record…"
                  : `${clients.data?.length ?? 0} clients · ${siteList.length} sites · ${testList.length} tests on record`}
              </p>
            </div>
          </div>
        </AnimatedContainer>

        {nothingYet ? (
          <AnimatedContainer direction="up" delay={0.1}>
            <EmptyEstate />
          </AnimatedContainer>
        ) : (
          <>
            <AnimatedContainer direction="up" delay={0.02}>
              {/* Above the figures, not below them: a disclosure somebody
                  scrolls past is a disclosure that did not happen. */}
              <SampleDataNotice counts={["tests", "findings", "sites"]} />
            </AnimatedContainer>

            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              data-testid="metrics-grid"
            >
              <AnimatedContainer direction="up" delay={0.05}>
                <Figure
                  label="Tests run"
                  value={testList.length}
                  icon={Scan}
                  testId="metric-tests"
                  hint={
                    testList.length === 0 ? "No tests recorded yet" : undefined
                  }
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.1}>
                <Figure
                  label="Findings"
                  value={findings}
                  icon={AlertTriangle}
                  tone={alert ? "critical" : "primary"}
                  testId="metric-findings"
                  hint={
                    totals.critical > 0
                      ? `${totals.critical} critical`
                      : "None critical"
                  }
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.15}>
                <Figure
                  label="Sites monitored"
                  value={siteList.length}
                  icon={Globe2}
                  testId="metric-sites"
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.2}>
                <Figure
                  label="Sites with findings"
                  value={perSite.filter((entry) => entry.weight > 0).length}
                  icon={ShieldCheck}
                  testId="metric-affected"
                />
              </AnimatedContainer>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <AnimatedContainer
                direction="up"
                delay={0.1}
                className="lg:col-span-2"
              >
                <div
                  className={`athena-panel overflow-hidden ${
                    alert ? "athena-panel--critical" : ""
                  }`}
                >
                  <div className="flex items-center justify-between px-5 pt-5">
                    <div className="athena-label">Estate</div>
                    <div className="text-xs text-muted-foreground">
                      {nodes.length} nodes · sized by relative risk
                    </div>
                  </div>
                  <WebGLBoundary
                    label="threat field"
                    fallback={
                      <div className="p-5" data-testid="threat-field-fallback">
                        <p className="mb-3 text-xs text-muted-foreground">
                          3D view unavailable on this display. The same sites,
                          listed:
                        </p>
                        <ul className="space-y-1">
                          {perSite.map(({ site, weight }) => (
                            <li
                              key={site.id}
                              className="athena-mono flex justify-between text-xs"
                            >
                              <span className="truncate">{site.name}</span>
                              <span className="text-muted-foreground">
                                {weight > 0 ? `risk ${weight}` : "clear"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    }
                  >
                    <Suspense
                      fallback={
                        <div
                          className="athena-scanline h-[22rem] w-full"
                          data-testid="threat-field-loading"
                        />
                      }
                    >
                      <ThreatField
                        nodes={nodes}
                        alert={alert}
                        className="h-[22rem] w-full"
                      />
                    </Suspense>
                  </WebGLBoundary>
                </div>
              </AnimatedContainer>

              <AnimatedContainer direction="up" delay={0.15}>
                <div className="athena-panel h-full p-5">
                  <div className="athena-label mb-4">Findings by severity</div>
                  {breakdown.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="breakdown-empty"
                    >
                      No findings recorded. This chart fills in as tests report
                      results.
                    </p>
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={breakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={82}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {breakdown.map((slice) => (
                              <Cell key={slice.name} fill={slice.colour} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--surface-1))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 10,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {SEVERITIES.map(({ key, label, token }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                        data-testid={`severity-${key}`}
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: `hsl(var(${token}))` }}
                          />
                          {label}
                        </span>
                        <span className="athena-figure">{totals[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedContainer>
            </div>

            <AnimatedContainer direction="up" delay={0.2}>
              <div className="athena-panel p-5">
                <div className="athena-label mb-4 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  Most affected sites
                </div>
                {topSites.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="top-sites-empty"
                  >
                    No site has findings against it yet.
                  </p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topSites}>
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--surface-2) / 0.5)" }}
                          contentStyle={{
                            background: "hsl(var(--surface-1))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 10,
                            fontSize: 12,
                          }}
                        />
                        {SEVERITIES.map(({ key, token }) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            stackId="severity"
                            fill={`hsl(var(${token}))`}
                            radius={
                              key === "critical" ? [4, 4, 0, 0] : undefined
                            }
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </AnimatedContainer>
          </>
        )}
      </div>
    </div>
  );
}
