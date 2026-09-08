/**
 * What the assistant is told about this deployment.
 *
 * Lifted out of routes.ts unchanged so the benchmark in tools/assistant-bench
 * measures the context the product actually sends. A copy would drift, and a
 * benchmark measuring a context nothing uses is worse than no benchmark: it
 * would report a number for something that does not exist.
 */

import { storage } from "./storage-unified";

/**
 * What the assistant is told about this deployment.
 *
 * Deliberately structural: how many clients, sites and tests exist, what the
 * sites are called, and the severity counts already on the record. Not the
 * bodies of findings, not documents, not anything from the audit log.
 *
 * The reason is that this leaves the machine. An operator who points
 * ATHENA_ASSISTANT_URL at a hosted provider is sending whatever is in here to
 * a third party, and in a product whose subject matter is other companies'
 * vulnerabilities the smallest useful context is the right one. The chat
 * screen says so in a line above the composer, because a disclosure nobody
 * reads is not a disclosure.
 */
export async function deploymentSummary(): Promise<string> {
  const [clients, sites, tests] = await Promise.all([
    storage.getAllClients(), storage.getAllSites(), storage.getAllTests(),
  ]);

  const totals = tests.reduce(
    (acc, test) => ({
      critical: acc.critical + test.criticalCount,
      high: acc.high + test.highCount,
      medium: acc.medium + test.mediumCount,
      low: acc.low + test.lowCount,
    }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  );

  const recent = tests
    .slice()
    .sort((a, b) => Number(new Date(b.startedAt)) - Number(new Date(a.startedAt)))
    .slice(0, 8)
    .map((test) => {
      const site = sites.find((one) => one.id === test.siteId);
      return `- ${test.testType} on ${site?.name ?? "an unnamed site"}: `
        + `${test.status}, ${test.criticalCount} critical / ${test.highCount} high `
        + `/ ${test.mediumCount} medium / ${test.lowCount} low`;
    });

  return [
    `${clients.length} clients, ${sites.length} sites, ${tests.length} tests recorded.`,
    `Across all tests: ${totals.critical} critical, ${totals.high} high, `
      + `${totals.medium} medium, ${totals.low} low.`,
    recent.length ? "Most recent tests:" : "No tests have been recorded yet.",
    ...recent,
  ].join("\n");
}
