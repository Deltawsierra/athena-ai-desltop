import { describe, it, expect } from "vitest";

import {
  fingerprint, ingest, nextStatus, sightingOf, statusFromVerdict,
  type Sighting,
} from "../server/findings";
import type { Finding } from "@shared/schema";

/**
 * The finding lifecycle. Two rules carry the weight and both are here.
 *
 * Identity is the place, not the payload -- the scanners try several payloads
 * against one endpoint, and a fingerprint that included them would file one
 * issue as many.
 *
 * And `fixed` is reachable only from a retest the engine answered `closed`.
 * Measured against a live engine, a target that is simply switched off answers
 * `inconclusive`; a lifecycle that treated that as a fix would report a host
 * going down as a vulnerability remediated.
 */

const place = (over: Partial<Sighting> = {}): Sighting => ({
  type: "json_injection", severity: "low", message: "JSON injection anomaly detected",
  target: "https://app.example", endpoint: null, header: null, ...over,
});

/** A store that behaves like the real one, in memory. */
function store() {
  const rows = new Map<string, Finding>();
  let next = 0;
  return {
    rows,
    async findFindingByFingerprint(clientId: string, fp: string) {
      // Keyed on the customer, as the real store is.
      return Array.from(rows.values()).find(
        (one) => one.clientId === clientId && one.fingerprint === fp,
      );
    },
    async createFinding(insert: Record<string, unknown>) {
      const now = new Date();
      const row = {
        id: `f${(next += 1)}`, siteId: null, severity: null, message: null,
        target: null, endpoint: null, header: null, status: "open", ownerId: null,
        statusNote: null, statusChangedBy: null, statusChangedAt: null,
        timesSeen: 1, lastTestId: null, lastRunId: null, fixedAt: null,
        fixedByRunId: null, fixedVerdict: null, reopenedAt: null, isSample: false,
        ...insert, firstSeenAt: now, lastSeenAt: now,
      } as unknown as Finding;
      rows.set(row.id, row);
      return row;
    },
    async updateFinding(id: string, patch: Partial<Finding>) {
      const existing = rows.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch, id } as Finding;
      rows.set(id, updated);
      return updated;
    },
  };
}

const context = {
  clientId: "c1", siteId: "s1", engagementRef: "c1:s1",
  target: "https://app.example", testId: "t1", runId: "run-1",
};

describe("what makes two sightings the same finding", () => {
  it("is the place and the customer, never the payload or the wording", () => {
    const one = fingerprint("c1", place({ endpoint: "https://app.example/api" }));
    const two = fingerprint("c1", place({
      endpoint: "https://app.example/api",
      // A different payload found it and the scanner worded it differently.
      // Same endpoint, same type: the same problem.
      message: "Server error with crafted JSON payload", severity: "medium",
    }));
    expect(one).toBe(two);

    // A different endpoint is a different problem.
    expect(fingerprint("c1", place({ endpoint: "https://app.example/api/v1" }))).not.toBe(one);
    // And a different customer is a different finding, with its own owner.
    expect(fingerprint("c2", place({ endpoint: "https://app.example/api" }))).not.toBe(one);
  });

  it("distinguishes one missing header from another", () => {
    // Five controls arrive under one finding type. Filing them as one would
    // say a site with no CSP has the same gap as one missing Referrer-Policy.
    const csp = fingerprint("c1", place({ type: "missing_security_header", header: "Content-Security-Policy" }));
    const ref = fingerprint("c1", place({ type: "missing_security_header", header: "Referrer-Policy" }));
    expect(csp).not.toBe(ref);
  });

  it("reads the place out of evidence, where the engine actually puts it", () => {
    // Measured: the pipeline moves a scanner's own fields into `evidence`
    // before the finding is returned.
    const seen = sightingOf(
      { type: "missing_security_header", severity: "low", evidence: { header: "Content-Security-Policy" } },
      "https://app.example",
    );
    expect(seen?.header).toBe("Content-Security-Policy");
    // The engine's own internal notes are not findings about the target.
    expect(sightingOf({ type: "error", internal: true }, "https://app.example")).toBeNull();
  });
});

describe("filing a scan's results", () => {
  it("folds repeats within one scan into a single finding", async () => {
    const db = store();
    // Four payloads landed on the same endpoint. That is one problem.
    const results = [
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api", payload: { a: 1 } } },
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api", payload: { b: 2 } } },
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api", payload: { c: 3 } } },
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api/v1", payload: { d: 4 } } },
      { type: "error", internal: true, details: "connection reset" },
    ];
    const filed = await ingest(db, results, context);
    expect(filed.raw).toBe(5);
    expect(filed.distinct).toBe(2);
    expect(filed.created).toBe(2);
    expect(db.rows.size).toBe(2);
  });

  it("recognises the same issue on a later scan instead of duplicating it", async () => {
    const db = store();
    const results = [
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api" } },
    ];
    await ingest(db, results, context);
    const again = await ingest(db, results, { ...context, testId: "t2", runId: "run-2" });

    expect(again.created).toBe(0);
    expect(again.updated).toBe(1);
    expect(db.rows.size).toBe(1);
    const row = Array.from(db.rows.values())[0];
    expect(row.timesSeen).toBe(2);
    expect(row.lastRunId).toBe("run-2");
  });

  it("reopens a finding the engine had closed, and drops the stale evidence", async () => {
    const db = store();
    const results = [
      { type: "json_injection", severity: "low", evidence: { endpoint: "https://app.example/api" } },
    ];
    await ingest(db, results, context);
    const id = Array.from(db.rows.keys())[0];
    await db.updateFinding(id, {
      status: "fixed", fixedAt: new Date(), fixedByRunId: "run-9", fixedVerdict: "closed",
    });

    const again = await ingest(db, results, { ...context, testId: "t3", runId: "run-3" });
    expect(again.reopened).toBe(1);

    const row = db.rows.get(id) as Finding;
    expect(row.status).toBe("open");
    expect(row.reopenedAt).not.toBeNull();
    // The evidence was real when it was taken and is out of date now. Keeping
    // it beside an open finding would suggest the fix still holds.
    expect(row.fixedByRunId).toBeNull();
    expect(row.fixedVerdict).toBeNull();
  });

  it("leaves an accepted risk accepted when it is seen again", async () => {
    // Somebody decided that on purpose; a rescan is not new information about
    // the decision.
    const db = store();
    const results = [{ type: "open_redirect", severity: "medium", evidence: { endpoint: "https://app.example/go" } }];
    await ingest(db, results, context);
    const id = Array.from(db.rows.keys())[0];
    await db.updateFinding(id, { status: "accepted", statusNote: "behind an internal gateway" });

    await ingest(db, results, { ...context, testId: "t4", runId: "run-4" });
    expect((db.rows.get(id) as Finding).status).toBe("accepted");
  });
});

describe("what may close a finding", () => {
  it("closes only on the engine's own word for it", () => {
    expect(statusFromVerdict("closed", "open")).toMatchObject({ status: "fixed", fixed: true });
  });

  it("never closes on inconclusive, whatever the finding was", () => {
    // The measured case: a target that is simply switched off.
    for (const current of ["open", "acknowledged", "accepted"] as const) {
      const decided = statusFromVerdict("inconclusive", current);
      expect(decided.fixed).toBe(false);
      expect(decided.status).toBe(current);
      expect(decided.detail).toContain("nothing about this finding's status");
    }
  });

  it("treats a verdict it does not recognise as inconclusive, never as closed", () => {
    expect(statusFromVerdict("something_new", "open")).toMatchObject({ status: "open", fixed: false });
    expect(statusFromVerdict("", "open").fixed).toBe(false);
  });

  it("reopens an accepted finding the engine found again", () => {
    // Evidence outranks an opinion formed before the evidence.
    expect(statusFromVerdict("still_open", "accepted")).toMatchObject({ status: "open", fixed: false });
  });

  it("reopens a fixed finding when a later retest cannot confirm it", () => {
    expect(statusFromVerdict("inconclusive", "fixed").status).toBe("open");
    expect(nextStatus("fixed")).toMatchObject({ status: "open", outcome: "reopened" });
  });
});
