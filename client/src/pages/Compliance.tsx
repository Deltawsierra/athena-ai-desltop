/**
 * Where an engagement stands against OWASP ASVS 4.0.3.
 *
 * The temptation in a compliance screen is a percentage. This one refuses to
 * show one, because the honest denominator would make it meaningless: the
 * engine's scanners bear on 21 of the standard's 286 requirements, so any
 * figure computed over the ones it tested would read as near-total compliance
 * while saying nothing about the other 265.
 *
 * What it shows instead is the shape of the coverage, with the untested
 * requirements counted first and largest. Four states, kept apart:
 *
 *   Failing      a finding from this engagement maps to it
 *   Tested       a scanner that could produce such a finding ran, and did not
 *   Not run      something covers it, but that scanner is not loaded
 *   Not covered  nothing this engine tests for bears on it at all
 *
 * Not run and not covered are separated on purpose. The first is a deployment
 * that switched something off and can be fixed this afternoon; the second is
 * the product's own limit. Reporting either as a pass is the failure this
 * screen exists to prevent.
 *
 * Requirement text is not shown. ASVS is CC BY-SA 4.0 and only its identifiers
 * are embedded here; every requirement links to the published standard.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleSlash, ExternalLink, EyeOff, ScrollText } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import type { Client, Site } from "@shared/schema";
import { asvsChapterUrl } from "@shared/asvs";

type ControlState = "failing" | "tested" | "not_run" | "not_covered";

interface AsvsRequirement {
  id: string;
  chapter: string;
  section: string;
  cwe: number | null;
  l1: boolean;
  l2: boolean;
  l3: boolean;
}

interface ControlRow {
  requirement: AsvsRequirement;
  state: ControlState;
  findings: Array<{ type: string; severity: string | null; message: string | null; testId: string }>;
  scanners: string[];
  why: string | null;
  approximate: boolean;
}

interface ComplianceView {
  client: { id: string; name: string };
  siteId: string | null;
  testsConsidered: number;
  scannersLoaded: string[] | null;
  rows: ControlRow[];
  summary: {
    version: string;
    failing: number;
    tested: number;
    notRun: number;
    notCovered: number;
    total: number;
    unmapped: Array<{ type: string; reason: string; count: number }>;
  };
}

const STATES: Record<ControlState, { label: string; colour: string; meaning: string }> = {
  failing: {
    label: "Failing",
    colour: "hsl(var(--sev-critical))",
    meaning: "A finding from this engagement bears on this requirement.",
  },
  tested: {
    label: "Tested",
    colour: "hsl(var(--primary))",
    meaning:
      "A scanner that can produce a finding against this requirement ran and produced none. " +
      "That is evidence, not a certification: the scanner tests what it tests.",
  },
  not_run: {
    label: "Not run",
    colour: "hsl(var(--gold))",
    meaning:
      "Something in this product covers this requirement, but that scanner is not loaded in " +
      "the engine this app is pointed at. Nothing looked.",
  },
  not_covered: {
    label: "Not covered",
    colour: "hsl(var(--muted-foreground))",
    meaning:
      "Nothing this engine tests for bears on this requirement. It has not been assessed here " +
      "by any means, and no conclusion about it can be drawn from this page.",
  },
};

const ORDER: ControlState[] = ["failing", "not_run", "tested", "not_covered"];


export default function Compliance() {
  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [showing, setShowing] = useState<ControlState>("failing");

  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: sites = [] } = useQuery<Site[]>({ queryKey: ["/api/sites"] });

  const sitesForClient = useMemo(
    () => sites.filter((site) => site.clientId === clientId),
    [sites, clientId],
  );

  const { data, isLoading } = useQuery<ComplianceView>({
    queryKey: [
      siteId
        ? `/api/compliance/${clientId}?siteId=${siteId}`
        : `/api/compliance/${clientId}`,
    ],
    enabled: clientId !== "",
  });

  const shown = (data?.rows ?? []).filter((row) => row.state === showing);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl space-y-6 p-6">
        <PageHeader
          title="Compliance"
          icon={<ScrollText className="h-8 w-8 text-primary" />}
          description={
            <>
              This engagement measured against OWASP ASVS {data?.summary.version ?? "4.0.3"}.
              What was not tested is counted first, because a control nobody
              looked at is not a control that passed.
            </>
          }
        />

        <GlassCard className="athena-fluted">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Engagement</Label>
              <Select value={clientId} onValueChange={(value) => { setClientId(value); setSiteId(""); }}>
                <SelectTrigger id="client" data-testid="select-compliance-client">
                  <SelectValue placeholder="Choose the engagement" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Select
                value={siteId}
                onValueChange={setSiteId}
                disabled={clientId === "" || sitesForClient.length === 0}
              >
                <SelectTrigger id="site" data-testid="select-compliance-site">
                  <SelectValue placeholder={clientId === "" ? "Choose an engagement first" : "Optional — narrows it"} />
                </SelectTrigger>
                <SelectContent>
                  {sitesForClient.map((site) => (
                    <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {clientId !== "" && isLoading && (
          <p className="text-sm text-muted-foreground">Reading the engagement…</p>
        )}

        {data && (
          <>
            {/* The coverage statement, before any figure that could be mistaken
                for a score. This is the sentence the page exists to say. */}
            <GlassCard
              ruling
              className={data.summary.notCovered > 0 ? "athena-panel--critical" : undefined}
            >
              <div className="flex items-start gap-3">
                <EyeOff className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "hsl(var(--gold))" }} />
                <div className="space-y-2">
                  <div className="athena-label" style={{ color: "hsl(var(--gold))" }}>
                    What this page does not tell you
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-coverage-statement">
                    <span className="athena-figure">{data.summary.notCovered + data.summary.notRun}</span>
                    {" "}of ASVS {data.summary.version}'s{" "}
                    <span className="athena-figure">{data.summary.total}</span> requirements were
                    not tested in this engagement
                    {data.summary.notCovered > 0 && (
                      <> — <span className="athena-figure">{data.summary.notCovered}</span> because
                      nothing this engine tests for bears on them at all</>
                    )}
                    {data.summary.notRun > 0 && (
                      <>, and <span className="athena-figure">{data.summary.notRun}</span> because
                      the scanner that covers them is not loaded</>
                    )}
                    . No conclusion about those requirements can be drawn from this page, in
                    either direction. There is no percentage here on purpose: one computed over
                    the requirements that were tested would read as near-total compliance while
                    saying nothing about the rest.
                  </p>
                  {data.scannersLoaded === null && (
                    <p className="text-sm" style={{ color: "hsl(var(--sev-critical))" }}>
                      The engine could not be asked which scanners it has loaded, so nothing here
                      is reported as tested. An engine that did not answer has not told us
                      anything ran.
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {ORDER.map((state) => {
                  const count = {
                    failing: data.summary.failing, tested: data.summary.tested,
                    not_run: data.summary.notRun, not_covered: data.summary.notCovered,
                  }[state];
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setShowing(state)}
                      className={`text-left ${showing === state ? "opacity-100" : "opacity-55"}`}
                      data-testid={`button-state-${state}`}
                    >
                      <div className="athena-label" style={{ color: STATES[state].colour }}>
                        {STATES[state].label}
                      </div>
                      <div
                        className="athena-figure text-2xl"
                        style={{ color: STATES[state].colour }}
                        data-testid={`text-count-${state}`}
                      >
                        {count}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                From {data.testsConsidered} scan{data.testsConsidered === 1 ? "" : "s"} on record for
                this engagement. Sample rows are excluded.
              </p>
            </GlassCard>

            <GlassCard>
              <div className="athena-label mb-1" style={{ color: STATES[showing].colour }}>
                {STATES[showing].label} — {shown.length}
              </div>
              <p className="mb-4 text-sm text-muted-foreground" data-testid="text-state-meaning">
                {STATES[showing].meaning}
              </p>

              {shown.length === 0 && (
                <p className="text-sm text-muted-foreground">No requirement is in this state.</p>
              )}

              <ul className="space-y-3" data-testid="list-controls">
                {shown.slice(0, 60).map((row) => (
                  <li
                    key={row.requirement.id}
                    className="rounded-lg border border-border/60 p-4"
                    data-testid={`control-${row.requirement.id}`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {/* Linked only when the standard has a file for this
                          chapter. An earlier version computed the filename
                          arithmetically and every link 404'd, which is worse
                          than no link: it looks like a citation. */}
                      {asvsChapterUrl(row.requirement.chapter) ? (
                        <a
                          className="athena-mono text-sm hover:underline"
                          style={{ color: STATES[row.state].colour }}
                          href={asvsChapterUrl(row.requirement.chapter) as string}
                          target="_blank"
                          rel="noreferrer noopener"
                          data-testid={`link-${row.requirement.id}`}
                        >
                          {row.requirement.id}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      ) : (
                        <span
                          className="athena-mono text-sm"
                          style={{ color: STATES[row.state].colour }}
                        >
                          {row.requirement.id}
                        </span>
                      )}
                      {row.requirement.cwe !== null && (
                        <a
                          className="athena-mono text-xs text-muted-foreground hover:underline"
                          href={`https://cwe.mitre.org/data/definitions/${row.requirement.cwe}.html`}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          CWE-{row.requirement.cwe}
                        </a>
                      )}
                      <span className="athena-mono text-xs text-muted-foreground">
                        {[row.requirement.l1 && "L1", row.requirement.l2 && "L2", row.requirement.l3 && "L3"]
                          .filter(Boolean).join(" ")}
                      </span>
                    </div>

                    {row.why && (
                      // How the pairing was found in the standard. This table is
                      // the one part of the mapping that is judgement rather
                      // than derivation, so it shows its working.
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mapped by: {row.why}
                        {row.approximate && (
                          <span style={{ color: "hsl(var(--gold))" }}>
                            {" "}— the standard names nothing exact for this; the nearest was taken.
                          </span>
                        )}
                      </p>
                    )}

                    {row.scanners.length > 0 && (
                      <p className="mt-1 athena-mono text-xs text-muted-foreground">
                        {row.state === "not_run" ? "would be covered by" : "covered by"}{" "}
                        {row.scanners.join(", ")}
                      </p>
                    )}

                    {row.findings.length > 0 && (
                      <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
                        {row.findings.map((finding, index) => (
                          <li key={index} className="text-sm">
                            <span
                              className="athena-label mr-2"
                              style={{ color: `hsl(var(--sev-${finding.severity ?? "info"}))` }}
                            >
                              {finding.severity ?? "info"}
                            </span>
                            <span className="athena-mono text-xs text-muted-foreground">
                              {finding.type}
                            </span>
                            {finding.message && (
                              <span className="ml-2 text-muted-foreground">{finding.message}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              {shown.length > 60 && (
                <p className="mt-3 text-sm athena-gold" data-testid="text-controls-truncated">
                  Showing the first 60 of {shown.length}.
                </p>
              )}
            </GlassCard>

            {data.summary.unmapped.length > 0 && (
              <GlassCard>
                <div className="athena-label mb-1 flex items-center gap-2">
                  <CircleSlash className="h-3.5 w-3.5" />
                  Findings this standard does not account for
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  These came back from the engine and map to no ASVS {data.summary.version}{" "}
                  requirement. They are shown because a map that quietly dropped them would
                  overstate how much of what this engine finds the standard covers.
                </p>
                <ul className="space-y-2" data-testid="list-unmapped">
                  {data.summary.unmapped.map((entry) => (
                    <li key={entry.type} className="text-sm" data-testid={`unmapped-${entry.type}`}>
                      <span className="athena-mono text-xs">{entry.type}</span>
                      <span className="ml-2 athena-figure">{entry.count}</span>
                      <p className="text-muted-foreground">{entry.reason}</p>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            <p className="text-xs text-muted-foreground">
              OWASP Application Security Verification Standard {data.summary.version}, CC BY-SA 4.0.
              Identifiers only; requirement text is at{" "}
              <a
                className="hover:underline"
                href="https://owasp.org/www-project-application-security-verification-standard/"
                target="_blank"
                rel="noreferrer noopener"
              >
                owasp.org
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
