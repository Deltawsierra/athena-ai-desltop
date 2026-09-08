/**
 * Generate shared/asvs.ts from the OWASP ASVS 4.0.3 release data.
 *
 * Run with the ASVS repository checked out somewhere and its path passed in:
 *
 *   node scripts/build-asvs.mjs /path/to/ASVS
 *
 * WHAT IS AND IS NOT EMBEDDED
 *
 * Identifiers only. ASVS requirement text is CC BY-SA 4.0, and share-alike on
 * text inlined into a proprietary product is a licensing decision rather than
 * an engineering one. So the generated file carries requirement ids, chapter
 * and section ids, CWE ids and the L1/L2/L3 levels -- facts and references --
 * and every requirement links out to the published standard for its wording.
 * `req_description` is read here, at build time, to locate the right
 * requirements; it is never written to the output.
 *
 * THE MAPPING
 *
 * Each entry below pairs one engine finding type with the ASVS requirements it
 * bears on. This table is Mythos's own judgement -- it is the one part of this
 * that is not derived -- so each entry records the search that located it, and
 * the build fails if any requirement id is not in the catalogue. A mapping
 * that silently points at nothing is worse than no mapping, because the
 * coverage figures downstream would still look plausible.
 *
 * Finding types deliberately absent from this table are listed in
 * UNMAPPED_FINDINGS with the reason. "Not mapped" is a first-class answer.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ASVS_ROOT = process.argv[2];
if (!ASVS_ROOT) {
  console.error("usage: node scripts/build-asvs.mjs /path/to/ASVS");
  process.exit(2);
}

const FLAT = join(
  ASVS_ROOT,
  "4.0/docs_en/OWASP Application Security Verification Standard 4.0.3-en.flat.json",
);

const VERSION = "4.0.3";
const LICENCE = "CC BY-SA 4.0";
const HOME = "https://owasp.org/www-project-application-security-verification-standard/";

/**
 * finding type -> { requirements, why }
 *
 * `why` records how the requirement was located in the standard, so a reviewer
 * can repeat the search rather than take the pairing on trust.
 */
const MAPPING = {
  command_injection: {
    requirements: ["V5.3.8"],
    why: 'the only requirement whose text names OS command injection ("operating system")',
  },
  rce: {
    // The scanner sends ${7*7} and friends and looks for 49 in the response:
    // it detects server-side template injection, not deserialization or
    // arbitrary code upload. The requirements that name template injection are
    // the honest home for it.
    requirements: ["V5.2.5", "V5.2.8"],
    why: 'requirements whose text names template injection; the scanner tests ${7*7} evaluation',
  },
  ssrf: {
    requirements: ["V5.2.6"],
    why: "the requirement whose text names SSRF",
  },
  directory_traversal: {
    // The scanner requests ?file=../../etc/passwd and looks for "root:", which
    // is local file inclusion. V12.3.1 covers the filename-metadata half.
    requirements: ["V5.3.9", "V12.3.1"],
    why: "requirements naming Local File Inclusion and path traversal",
  },
  open_redirect: {
    requirements: ["V5.1.5"],
    why: "the requirement whose text names URL redirects and forwards",
  },
  json_injection: {
    requirements: ["V5.3.6", "V13.2.2"],
    why: "requirements naming JSON injection and JSON schema validation",
  },
  header_injection: {
    requirements: ["V5.1.1", "V13.1.1"],
    why: "parameter pollution and consistent parsing; the scanner injects CRLF and payloads into request headers",
  },
  auth_bruteforce: {
    requirements: ["V2.2.1"],
    why: "the requirement whose text names brute force and anti-automation of credential testing",
  },
  rate_limit_missing: {
    requirements: ["V11.1.4"],
    why: "the requirement naming anti-automation controls against excessive calls",
  },
  api_fuzz: {
    // The scanner flags 5xx responses and stack traces. A stack trace reaching
    // a client is a production debug-mode failure; the rest is an anomaly that
    // needs a person, which is why this maps to one requirement and not many.
    requirements: ["V14.3.2"],
    why: "the requirement naming debug modes disabled in production; the scanner flags stack traces and 5xx",
  },
  ssl_error: {
    requirements: ["V9.1.1", "V9.2.1"],
    why: "requirements naming TLS for all client connectivity and trusted TLS certificates",
  },
  subdomain: {
    requirements: ["V10.3.3"],
    why: "the requirement naming subdomain takeover",
  },
};

/**
 * Which security header maps where. `missing_security_header` findings carry
 * the header name, so this is keyed on the header rather than lumping five
 * different controls under one finding type.
 */
const HEADER_MAPPING = {
  "Content-Security-Policy": {
    requirements: ["V14.4.3"],
    why: "the requirement naming a Content Security Policy response header",
  },
  "X-Frame-Options": {
    requirements: ["V14.4.7"],
    why: "the requirement that content cannot be embedded in a third-party site by default",
  },
  "X-Content-Type-Options": {
    requirements: ["V14.4.4"],
    why: "the requirement naming X-Content-Type-Options: nosniff",
  },
  "Referrer-Policy": {
    requirements: ["V14.4.6"],
    why: "the requirement naming a suitable Referrer-Policy header",
  },
  "Strict-Transport-Security": {
    // ASVS 4.0.3 has no requirement that names HSTS. V9.1.1 is the mechanism's
    // purpose -- no fallback to unencrypted communication -- and the nearest
    // thing the standard has. Recorded as approximate rather than exact.
    requirements: ["V9.1.1"],
    why: "ASVS 4.0.3 names no HSTS requirement; V9.1.1 requires TLS with no fallback to unencrypted, which is what HSTS enforces",
    approximate: true,
  },
};

/**
 * Finding types with no ASVS requirement, and why. Rendered in the product:
 * a finding the standard does not cover is a gap in the mapping, and hiding it
 * would make the coverage figure look better than it is.
 */
/**
 * Which scanner produces which finding type, extracted from the engine's own
 * registry in engine/core.py and the `"type"` literals in each scanner module,
 * rather than written from memory.
 *
 * This is load-bearing for honesty, not bookkeeping. Without it the product
 * cannot tell "a scanner looked and found nothing" from "nothing looked",
 * and a requirement nobody tested would render identically to one that
 * passed. Two of these -- port_scanner and subdomain_scanner -- have no `name`
 * attribute of their own and are named only by that registry, which is why the
 * registry is the authority here.
 */
const SCANNER_FINDINGS = {
  api_fuzz: ["api_fuzz"],
  basic_scanner: ["basic_info", "ssl_error"],
  bruteforce: ["auth_bruteforce"],
  command_injection: ["command_injection"],
  directory_traversal: ["directory_traversal"],
  endpoint_discovery: ["endpoint_exposed"],
  header_injection: ["header_injection"],
  header_scanner: ["missing_security_header"],
  json_injection: ["json_injection"],
  open_redirect: ["open_redirect"],
  port_scanner: ["open_port"],
  prompt_injection: ["prompt_injection"],
  rate_limit_tester: ["rate_limit_missing"],
  rce: ["rce"],
  ssrf: ["ssrf"],
  subdomain_scanner: ["subdomain"],
  waf_detector: ["waf_detected"],
};

const UNMAPPED_FINDINGS = {
  prompt_injection: "ASVS 4.0.3 contains no requirement about LLM prompt injection. The standard predates it.",
  basic_info: "reconnaissance output, not a control failure",
  open_port: "an observation about the host, not an application control",
  waf_detected: "an observation about the deployment, not a control failure",
  endpoint_exposed: "a discovered path; whether it should be reachable is a question for a person",
  error: "the engine reporting its own trouble, not a finding about the target",
  timeout: "the engine reporting its own trouble, not a finding about the target",
};

const raw = JSON.parse(readFileSync(FLAT, "utf8")).requirements;

const catalogue = raw.map((r) => ({
  id: r.req_id,
  chapter: r.chapter_id,
  section: r.section_id,
  cwe: r.cwe ? Number(r.cwe) : null,
  l1: r.level1 !== "",
  l2: r.level2 !== "",
  l3: r.level3 !== "",
}));

const known = new Set(catalogue.map((r) => r.id));

// A mapped id that is not in the catalogue would produce a control the product
// claims to test and cannot name. Fail the build rather than ship it.
const missing = [];
for (const [finding, entry] of Object.entries(MAPPING)) {
  for (const id of entry.requirements) if (!known.has(id)) missing.push(`${finding} -> ${id}`);
}
for (const [header, entry] of Object.entries(HEADER_MAPPING)) {
  for (const id of entry.requirements) if (!known.has(id)) missing.push(`${header} -> ${id}`);
}
if (missing.length) {
  console.error("these mapped requirements are not in ASVS " + VERSION + ":");
  for (const one of missing) console.error("  " + one);
  process.exit(1);
}

// Every finding type in the mapping must be one some scanner can actually
// produce. A mapping for a finding type nothing emits is a control the
// product claims to cover and never will.
const emitted = new Set(Object.values(SCANNER_FINDINGS).flat());
// `error` and `timeout` are excluded: the engine emits them itself, marked
// internal, to report its own trouble rather than anything about the target.
// They are listed as unmapped because they do turn up in results and a reader
// deserves to know why they map to nothing.
const ENGINE_INTERNAL = new Set(["error", "timeout"]);
const phantom = [
  ...Object.keys(MAPPING),
  ...Object.keys(UNMAPPED_FINDINGS),
].filter((finding) => !emitted.has(finding) && !ENGINE_INTERNAL.has(finding));
if (phantom.length) {
  console.error("no scanner emits these finding types: " + phantom.join(", "));
  process.exit(1);
}

const mapped = new Set([
  ...Object.values(MAPPING).flatMap((entry) => entry.requirements),
  ...Object.values(HEADER_MAPPING).flatMap((entry) => entry.requirements),
]);

const banner = `/**
 * OWASP ASVS ${VERSION}, as identifiers.
 *
 * GENERATED by scripts/build-asvs.mjs. Do not edit by hand; edit the mapping
 * in that script and regenerate.
 *
 * Requirement text is NOT here. ASVS is published under ${LICENCE}, and this
 * file carries only identifiers, CWE references and verification levels, with
 * a link out to the published standard for the wording. Attribution:
 * OWASP Application Security Verification Standard ${VERSION}, ${LICENCE}.
 * ${HOME}
 *
 * ${catalogue.length} requirements. ${mapped.size} of them can be reached by
 * something this engine tests for -- which is the number that matters, and the
 * reason the product says how many it did not test rather than reporting a
 * percentage over the ones it did.
 */
`;

const out = `${banner}
export const ASVS_VERSION = ${JSON.stringify(VERSION)};
export const ASVS_LICENCE = ${JSON.stringify(LICENCE)};
export const ASVS_HOME = ${JSON.stringify(HOME)};

export interface AsvsRequirement {
  id: string;
  chapter: string;
  section: string;
  /** The CWE the standard associates with this requirement, where it names one. */
  cwe: number | null;
  l1: boolean;
  l2: boolean;
  l3: boolean;
}

export interface FindingMapping {
  requirements: string[];
  /** How the pairing was located in the standard, so a reviewer can repeat it. */
  why: string;
  /** True when the standard has no requirement for this and the nearest was taken. */
  approximate?: boolean;
}

export const ASVS_CATALOGUE: AsvsRequirement[] = ${JSON.stringify(catalogue, null, 2)};

/** Engine finding type to the requirements it bears on. */
export const FINDING_MAPPING: Record<string, FindingMapping> = ${JSON.stringify(MAPPING, null, 2)};

/** \`missing_security_header\` carries the header name; each header is its own control. */
export const HEADER_MAPPING: Record<string, FindingMapping> = ${JSON.stringify(HEADER_MAPPING, null, 2)};

/**
 * Which scanner produces which finding type, from the engine's own registry.
 * Without this the product cannot tell a requirement that was tested and
 * passed from one nothing ever looked at.
 */
export const SCANNER_FINDINGS: Record<string, string[]> = ${JSON.stringify(SCANNER_FINDINGS, null, 2)};

/** Finding types with no requirement behind them, and why. Shown, not hidden. */
export const UNMAPPED_FINDINGS: Record<string, string> = ${JSON.stringify(UNMAPPED_FINDINGS, null, 2)};
`;

writeFileSync(join(process.cwd(), "shared/asvs.ts"), out);
console.log(
  `wrote shared/asvs.ts: ${catalogue.length} requirements, ` +
    `${mapped.size} reachable by ${Object.keys(MAPPING).length + Object.keys(HEADER_MAPPING).length} mappings, ` +
    `${Object.keys(UNMAPPED_FINDINGS).length} finding types deliberately unmapped`,
);
