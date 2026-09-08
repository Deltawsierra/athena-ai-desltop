/**
 * The evidence pack, which this product has advertised and never produced.
 *
 * The engine has built them all along: an Ed25519 signature over a manifest
 * committing to a Merkle root, with a per-source status so a reduced pack can
 * still be verified. Nothing in this app had ever asked for one, which is why
 * "Evidence Pack" was a line on a website rather than a button.
 *
 * Two things this screen exists to prevent, both measured against a running
 * engine before it was written.
 *
 * An unsigned pack must not look like a signed one. With no ENGINE_EVIDENCE_KEY
 * set the engine returns the pack anyway, with `signed: false` and the reason
 * -- deliberately, so nobody hands over an unsigned document believing it was
 * checked. That distinction is the loudest thing on this page.
 *
 * And an incomplete pack must not read as complete. An unscoped pack reports
 * `scans: excluded`, because the scan record has no tenant column; the pack
 * still returns 201 with six other sources and a valid root. Every source is
 * listed here with its status and, where it was left out, the engine's reason.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck, FileArchive, ShieldAlert, ShieldOff, Download, Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/lib/queryClient";
import type { Client, Site } from "@shared/schema";

interface EvidenceSource {
  source: string;
  status: string;
  reason: string | null;
  records: number;
  chainOk: boolean;
  chainDetail: string;
  chainPartial: boolean;
  chainHeadAuthentic: boolean;
}

interface EvidenceSignature {
  algorithm: string;
  keyId: string | null;
  publicKey: string | null;
  signature: string;
}

interface EvidencePack {
  format: string;
  generatedAt: string | null;
  tenant: string | null;
  reason: string | null;
  merkleRoot: string | null;
  leafCount: number;
  signed: boolean;
  signature: EvidenceSignature | null;
  unsignedReason: string | null;
  sources: EvidenceSource[];
  document: unknown;
}

/** Included, excluded, truncated — coloured so the exceptions stand out. */
function statusColour(status: string): string {
  if (status === "included") return "hsl(var(--primary))";
  if (status === "excluded") return "hsl(var(--sev-high))";
  return "hsl(var(--gold))";
}

export default function Evidence() {
  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [reason, setReason] = useState("");

  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: sites = [] } = useQuery<Site[]>({ queryKey: ["/api/sites"] });

  const sitesForClient = useMemo(
    () => sites.filter((site) => site.clientId === clientId),
    [sites, clientId],
  );

  const build = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/evidence-pack", {
        clientId, siteId: siteId || undefined, reason,
      });
      return (await response.json()) as EvidencePack;
    },
  });

  const pack = build.data;

  const save = () => {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack.document, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Named for what it is and when, because a file called download.json in
    // somebody's folder in six months is not evidence of anything.
    link.download = `evidence-pack-${pack.tenant ?? "tenant"}-${
      (pack.generatedAt ?? new Date().toISOString()).replace(/[:.]/g, "-")
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6 p-6 max-w-5xl">
        <PageHeader
          title="Evidence"
          icon={<FileArchive className="h-8 w-8 text-primary" />}
          description="A signed, verifiable record of what this deployment did, assembled by the engine and checkable by somebody who does not trust it."
        />

        <GlassCard className="athena-fluted">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (clientId && reason.trim()) build.mutate();
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Engagement</Label>
                <Select value={clientId} onValueChange={(value) => { setClientId(value); setSiteId(""); }}>
                  <SelectTrigger id="client" data-testid="select-evidence-client">
                    <SelectValue placeholder="Whose records go in the pack" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Always sent. Without an engagement the engine leaves the scan
                  record out of the pack entirely, and says so.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Select
                  value={siteId}
                  onValueChange={setSiteId}
                  disabled={clientId === "" || sitesForClient.length === 0}
                >
                  <SelectTrigger id="site" data-testid="select-evidence-site">
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

            <div className="space-y-2">
              <Label htmlFor="reason">What this pack is for</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Customer security review, Q3 audit, incident 2026-114…"
                data-testid="input-evidence-reason"
              />
              <p className="text-xs text-muted-foreground">
                Recorded in the signed manifest and in this deployment's audit
                log. Issuing a pack assembles somebody's records into a document
                that leaves this machine; why is part of the record.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={!clientId || !reason.trim() || build.isPending}
                data-testid="button-build-pack"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                {build.isPending ? "Asking the engine…" : "Build the pack"}
              </Button>
              <span className="text-xs text-muted-foreground">
                The engine assembles and signs it. This app does not author evidence.
              </span>
            </div>
          </form>
        </GlassCard>

        {build.isError && (
          <GlassCard ruling>
            <div className="flex items-start gap-3">
              <ShieldAlert className="athena-gold mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="athena-label">No pack was built</div>
                <p className="mt-1 text-sm text-muted-foreground" data-testid="text-evidence-error">
                  {(build.error as Error).message}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {pack && (
          <>
            {/* The signature, first and loudest. An unsigned pack is a record,
                not proof, and the difference is the whole product. */}
            <GlassCard
              ruling={!pack.signed}
              className={pack.signed ? undefined : "athena-panel--critical"}
            >
              <div className="flex items-start gap-3">
                {pack.signed ? (
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "hsl(var(--primary))" }} />
                ) : (
                  <ShieldOff className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "hsl(var(--sev-critical))" }} />
                )}
                <div className="min-w-0 space-y-1">
                  <div
                    className="athena-label"
                    style={{ color: pack.signed ? "hsl(var(--primary))" : "hsl(var(--sev-critical))" }}
                    data-testid="text-signed-status"
                  >
                    {pack.signed ? "Signed" : "Not signed"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pack.signed ? (
                      <>
                        {pack.signature?.algorithm ?? "ed25519"} over the
                        manifest, which commits to the Merkle root below.
                        Somebody who does not trust this deployment can check
                        it -- against the published key named here, not against
                        the copy inside the pack. A forger who re-signs a
                        doctored pack replaces that copy too.
                      </>
                    ) : (
                      <>
                        {pack.unsignedReason ?? "the engine did not sign this pack"}.
                        {" "}This is a record of what happened, not proof of it:
                        nothing here can be checked by somebody who does not
                        already trust this deployment. Do not hand it over as
                        evidence.
                      </>
                    )}
                  </p>
                  {pack.signature && (
                    <div className="pt-1">
                      <div className="athena-label">Verify against key</div>
                      <div
                        className="athena-mono truncate text-xs text-muted-foreground"
                        data-testid="text-signing-key-id"
                      >
                        {pack.signature.keyId ?? "the engine did not name the key"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
                <div>
                  <div className="athena-label">Records</div>
                  <div className="athena-figure text-2xl" data-testid="text-leaf-count">
                    {pack.leafCount}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="athena-label">Merkle root</div>
                  <div className="athena-mono truncate text-xs text-muted-foreground" data-testid="text-merkle-root">
                    {pack.merkleRoot ?? "none"}
                  </div>
                </div>
                <div>
                  <div className="athena-label">Format</div>
                  <div className="athena-mono text-xs text-muted-foreground">{pack.format}</div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button type="button" variant="secondary" onClick={save} data-testid="button-save-pack">
                  <Download className="mr-2 h-4 w-4" />
                  Save the pack
                </Button>
                <span className="text-xs text-muted-foreground">
                  The engine's document, unchanged, so it still verifies.
                </span>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="athena-label mb-4 flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" />
                What went in, and what did not
              </div>
              <ul className="space-y-3" data-testid="list-evidence-sources">
                {pack.sources.map((source) => (
                  <li
                    key={source.source}
                    className="rounded-lg border p-3"
                    style={{ borderColor: `${statusColour(source.status)} / 0.3` }}
                    data-testid={`source-${source.source}`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="athena-mono text-sm">{source.source}</span>
                      <span className="athena-label" style={{ color: statusColour(source.status) }}>
                        {source.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {source.records} {source.records === 1 ? "record" : "records"}
                      </span>
                      {!source.chainOk && (
                        <span className="athena-label" style={{ color: "hsl(var(--sev-critical))" }}>
                          chain failed
                        </span>
                      )}
                      {source.chainPartial && (
                        <span className="athena-label athena-gold">chain partial</span>
                      )}
                    </div>
                    {source.reason && (
                      // The engine's own explanation for leaving a source out.
                      // Without it a pack missing every scan reads as a pack
                      // with nothing to report.
                      <p className="mt-2 text-sm text-muted-foreground">{source.reason}</p>
                    )}
                    {source.chainDetail && (
                      <p className="mt-1 text-xs text-muted-foreground">{source.chainDetail}</p>
                    )}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
