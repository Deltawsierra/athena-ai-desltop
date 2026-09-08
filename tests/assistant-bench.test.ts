import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { systemPrompt } from "../server/assistant";

/**
 * The benchmark must measure the product, not a copy of it.
 *
 * tools/assistant-bench is a standalone script -- it reads a database file
 * directly, without the server's storage layer -- so it necessarily restates
 * two things the product owns: the assistant's system prompt, and the shape of
 * the deployment summary. Restated text drifts, and a benchmark measuring a
 * prompt nothing sends would report a number for something that does not
 * exist. That is the same defect as a control that passes because nothing
 * tested it, so these keep the two in step.
 */
const BENCH = readFileSync(join(__dirname, "../tools/assistant-bench/bench.mjs"), "utf8");

describe("the assistant benchmark measures what the product actually sends", () => {
  it("uses the product's own system prompt, line for line", () => {
    // Every line of the real prompt, minus the context the bench substitutes.
    const real = systemPrompt("__CONTEXT__").content
      .split("\n")
      .filter((line) => line.trim() !== "" && line !== "__CONTEXT__");

    for (const line of real) {
      expect(
        BENCH.includes(line),
        `bench.mjs is missing a line of the product's system prompt: "${line}"`,
      ).toBe(true);
    }
  });

  it("builds the same deployment summary the product does", () => {
    // The sentences server/summary.ts emits. If that file is reworded, the
    // bench is measuring a context the product no longer sends.
    const summary = readFileSync(join(__dirname, "../server/summary.ts"), "utf8");
    for (const shape of [
      "clients, ${", "sites, ${", "tests recorded.",
      "Across all tests: ${", "Most recent tests:", "No tests have been recorded yet.",
    ]) {
      expect(summary.includes(shape), `server/summary.ts no longer emits ${shape}`).toBe(true);
      expect(BENCH.includes(shape), `bench.mjs no longer emits ${shape}`).toBe(true);
    }
  });

  it("keeps traps as a real share of the question set", () => {
    // The fabrication rate is the number that decides whether a local model is
    // safe here. A question set that quietly lost its traps would report a
    // reassuring score forever.
    const { questions } = JSON.parse(
      readFileSync(join(__dirname, "../tools/assistant-bench/questions.json"), "utf8"),
    );
    const traps = questions.filter((one: { kind: string }) => one.kind === "trap");
    const facts = questions.filter((one: { kind: string }) => one.kind === "fact");

    expect(traps.length).toBeGreaterThanOrEqual(facts.length);
    // Each trap says why it is one, so a reader can check the claim.
    for (const trap of traps) expect(trap.why, `${trap.id} has no stated reason`).toBeTruthy();
    // And at least one measures whether scan output can take the model over.
    expect(questions.some((one: { kind: string }) => one.kind === "injection")).toBe(true);
  });
});
