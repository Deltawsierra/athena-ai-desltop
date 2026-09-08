import { describe, it, expect } from "vitest";

import { controlMap, type ScanFinding } from "../server/compliance";
import { ASVS_CATALOGUE, FINDING_MAPPING, HEADER_MAPPING, SCANNER_FINDINGS } from "@shared/asvs";

/**
 * The compliance map, whose entire risk is making an untested control look
 * like a passing one.
 *
 * The engine's scanners bear on 21 of ASVS 4.0.3's 286 requirements. A screen
 * that rendered the other 265 as satisfied would be false about the great
 * majority of the standard, and convincing, because the 21 are real. These
 * tests hold the four states apart.
 */

const ALL_SCANNERS = Object.keys(SCANNER_FINDINGS);

const finding = (over: Partial<ScanFinding> = {}): ScanFinding => ({
  testId: "test-1", type: "command_injection", severity: "high",
  message: "Command injection vulnerability detected", ...over,
});

describe("mapping findings to ASVS requirements", () => {
  it("marks a requirement failing when a finding maps to it", () => {
    const { rows } = controlMap([finding()], ALL_SCANNERS);
    const row = rows.find((one) => one.requirement.id === "V5.3.8");
    expect(row?.state).toBe("failing");
    expect(row?.findings).toHaveLength(1);
    // The reason the pairing exists travels with it, so a reviewer can repeat
    // the search rather than take it on trust.
    expect(row?.why).toContain("operating system");
  });

  it("never reports a requirement as tested when nothing tests it", () => {
    // The heart of it. With every scanner loaded and no findings at all, the
    // requirements no scanner can reach must still not read as satisfied.
    const { rows, summary } = controlMap([], ALL_SCANNERS);

    expect(summary.failing).toBe(0);
    expect(summary.tested).toBeGreaterThan(0);
    expect(summary.notCovered).toBeGreaterThan(0);
    expect(summary.tested + summary.notCovered + summary.notRun + summary.failing)
      .toBe(ASVS_CATALOGUE.length);

    // Every requirement counted as tested has a scanner behind it.
    for (const row of rows.filter((one) => one.state === "tested")) {
      expect(row.scanners.length).toBeGreaterThan(0);
    }
    // And every one counted as not covered has none.
    for (const row of rows.filter((one) => one.state === "not_covered")) {
      expect(row.scanners).toEqual([]);
    }
  });

  it("reports the tested count as the small number it is", () => {
    // 21 of 286. If this number ever grows without the mapping growing, the
    // map has started claiming coverage it does not have.
    const { summary } = controlMap([], ALL_SCANNERS);
    const reachable = new Set([
      ...Object.values(FINDING_MAPPING).flatMap((entry) => entry.requirements),
      ...Object.values(HEADER_MAPPING).flatMap((entry) => entry.requirements),
    ]);
    expect(summary.tested).toBe(reachable.size);
    expect(summary.notCovered).toBe(ASVS_CATALOGUE.length - reachable.size);
  });

  it("says not run, not tested, when the scanner behind a requirement is absent", () => {
    // A deployment that switched a scanner off has not tested what it covers,
    // and that is a different thing from the product not covering it.
    const withoutCommandInjection = ALL_SCANNERS.filter((one) => one !== "command_injection");
    const { rows } = controlMap([], withoutCommandInjection);
    const row = rows.find((one) => one.requirement.id === "V5.3.8");
    expect(row?.state).toBe("not_run");
    // Still names the scanner that would have covered it, so the operator can
    // see what to turn back on.
    expect(row?.scanners).toContain("command_injection");
  });

  it("reads an engine it could not ask as not run, never as tested", () => {
    // Null is not an empty list. An engine that did not answer has not told us
    // anything ran, and treating silence as a pass is how this screen lies.
    const { rows, summary } = controlMap([], null);
    expect(summary.tested).toBe(0);
    expect(summary.notRun).toBeGreaterThan(0);
    expect(rows.find((one) => one.requirement.id === "V5.3.8")?.state).toBe("not_run");
  });

  it("treats each missing security header as its own control", () => {
    // Five controls arrive under one finding type. Reporting them as one would
    // say a site with no CSP has the same gap as one missing Referrer-Policy.
    const { rows } = controlMap(
      [finding({ type: "missing_security_header", header: "Content-Security-Policy" })],
      ALL_SCANNERS,
    );
    expect(rows.find((one) => one.requirement.id === "V14.4.3")?.state).toBe("failing");
    // The other headers' requirements were tested by the same scanner and not
    // found failing -- they are not dragged down with it.
    expect(rows.find((one) => one.requirement.id === "V14.4.6")?.state).toBe("tested");
  });

  it("marks the HSTS pairing approximate, because the standard names no HSTS requirement", () => {
    const { rows } = controlMap([], ALL_SCANNERS);
    const row = rows.find((one) => one.requirement.id === "V9.1.1");
    // V9.1.1 is also reached exactly by ssl_error, so it is not approximate.
    expect(row?.approximate).toBe(false);
    expect(HEADER_MAPPING["Strict-Transport-Security"].approximate).toBe(true);
  });

  it("counts findings that map to nothing, with the reason, rather than dropping them", () => {
    // Prompt injection is the flagship AI finding and ASVS 4.0.3 has no
    // requirement for it. A map that quietly dropped it would overstate how
    // much of what the engine finds the standard accounts for.
    const { summary } = controlMap(
      [finding({ type: "prompt_injection" }), finding({ type: "prompt_injection" })],
      ALL_SCANNERS,
    );
    const entry = summary.unmapped.find((one) => one.type === "prompt_injection");
    expect(entry?.count).toBe(2);
    expect(entry?.reason).toContain("no requirement about LLM prompt injection");
  });

  it("ignores the engine's own internal notes", () => {
    // `error` and `timeout` are the engine reporting its own trouble. Counting
    // them as unmapped findings about the target would be wrong twice.
    const { summary } = controlMap(
      [finding({ type: "error", internal: true }), finding({ type: "timeout", internal: true })],
      ALL_SCANNERS,
    );
    expect(summary.unmapped).toEqual([]);
  });
});
