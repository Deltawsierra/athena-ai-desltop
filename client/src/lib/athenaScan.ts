/**
 * The shape of one Athena scan, and a worked example of it.
 *
 * This is deliberately the shape the engine already speaks in -- a scan is a
 * job with a status, a set of modules that each move through the same small
 * state machine, a running commentary, and the findings that fall out -- so the
 * page below can be handed a live scan later without being redrawn. Nothing
 * here is fetched yet; `SAMPLE_SCAN` is a fixture that reads like a real run
 * against a customer-support agent, so the design can be judged against
 * something that looks like the truth rather than lorem.
 */

export type ModuleState =
  | "complete"
  | "scanning"
  | "pending"
  | "queued"
  | "waiting";

export interface ScanModule {
  id: string;
  label: string;
  state: ModuleState;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  category: string;
  area: string;
  impact: "High" | "Medium" | "Low";
  status: "Open" | "Acknowledged" | "Resolved";
}

export interface ReasoningEntry {
  time: string;
  text: string;
}

export interface DataExposureType {
  label: string;
  kind: "pii" | "financial" | "internal" | "credential";
}

export interface AthenaScan {
  target: {
    name: string;
    version: string;
    environment: string;
    description: string;
    tags: string[];
    startedLabel: string;
    elapsedLabel: string;
    etaLabel: string;
  };
  status: "running" | "complete" | "failed" | "stopped";
  /** 0–100, the fraction of the whole scan the engine has finished. */
  percent: number;
  modules: ScanModule[];
  /** The current thought, shown as a pull-quote above the log. */
  narration: string;
  reasoning: ReasoningEntry[];
  risk: {
    score: number; // 0–100
    band: "Low" | "Moderate" | "Elevated" | "Critical";
    summary: string;
  };
  findings: {
    total: number;
    bySeverity: Record<Exclude<Severity, "info">, number>;
    top: Finding[];
  };
  coverage: {
    completed: number;
    total: number;
    percent: number;
  };
  dataExposure: DataExposureType[];
}

export const SAMPLE_SCAN: AthenaScan = {
  target: {
    name: "Customer Support Agent",
    version: "v2.4.1",
    environment: "Production",
    description:
      "AI assistant for customer support, access to CRM, knowledge base, and internal tools.",
    tags: ["OpenAI GPT-4o", "Web App", "Customer Data", "Finance", "Production"],
    startedLabel: "Today, 7:14 AM",
    elapsedLabel: "12m 36s",
    etaLabel: "~3 minutes",
  },
  status: "running",
  percent: 72,
  modules: [
    { id: "data-boundary", label: "Data Boundary Assessment", state: "complete" },
    { id: "capability-map", label: "System Capability Map", state: "complete" },
    { id: "personal-context", label: "Personal Context Exposure", state: "scanning" },
    { id: "data-lifecycle", label: "Data Lifecycle Review", state: "pending" },
    { id: "training-reuse", label: "Training / Feedback / Reuse", state: "waiting" },
    { id: "provider-assurance", label: "Provider Assurance Profile", state: "queued" },
    { id: "effective-access", label: "Effective Access", state: "queued" },
    { id: "adversarial", label: "Adversarial Behavior Tests", state: "queued" },
  ],
  narration:
    "I’m analyzing how this system handles customer data and where it may flow beyond intended boundaries.",
  reasoning: [
    { time: "7:26:12", text: "Identified customer PII in prompt templates" },
    { time: "7:26:01", text: "Tracing data flow from support agent to CRM API" },
    { time: "7:25:48", text: "Evaluating third-party data sharing (OpenAI)" },
    { time: "7:25:32", text: "Testing for prompt injection vulnerabilities" },
    { time: "7:25:11", text: "Analyzing retention and reuse policies" },
    { time: "7:24:58", text: "Mapping effective access for connected tools" },
    { time: "7:24:33", text: "Running adversarial behavior tests" },
    { time: "7:24:01", text: "Building system capability map" },
    { time: "7:23:17", text: "Discovering data boundaries and entry points" },
    { time: "7:22:49", text: "Initializing Athena scan…" },
  ],
  risk: {
    score: 67,
    band: "Moderate",
    summary: "Some sensitive data exposure and control gaps detected.",
  },
  findings: {
    total: 23,
    bySeverity: { critical: 4, high: 7, medium: 8, low: 4 },
    top: [
      {
        id: "f1",
        severity: "critical",
        title: "Customer PII included in support prompts",
        category: "Data Exposure",
        area: "Prompt Handling",
        impact: "High",
        status: "Open",
      },
      {
        id: "f2",
        severity: "high",
        title: "Unrestricted access to CRM customer records",
        category: "Excessive Access",
        area: "Connected Tools",
        impact: "High",
        status: "Open",
      },
      {
        id: "f3",
        severity: "high",
        title: "Potential data retention beyond policy",
        category: "Data Lifecycle",
        area: "Data Storage",
        impact: "Medium",
        status: "Open",
      },
      {
        id: "f4",
        severity: "medium",
        title: "Third-party data sharing lacks contractual controls",
        category: "Provider Risk",
        area: "OpenAI",
        impact: "Medium",
        status: "Open",
      },
    ],
  },
  coverage: { completed: 6, total: 7, percent: 86 },
  dataExposure: [
    { label: "PII", kind: "pii" },
    { label: "Financial", kind: "financial" },
    { label: "Internal", kind: "internal" },
  ],
};

/** The four verbs of the pitch, used in the hero rail. */
export const SCAN_STAGES = ["Scan", "Analyze", "Evidence", "Deploy"] as const;

export const SEVERITY_ORDER: Exclude<Severity, "info">[] = [
  "critical",
  "high",
  "medium",
  "low",
];

/** Copy + token for each module state, kept in one place so the ring, the
 *  chips and any future list all describe a state the same way. */
export const MODULE_STATE_META: Record<
  ModuleState,
  { label: string; tone: "done" | "live" | "idle" }
> = {
  complete: { label: "Complete", tone: "done" },
  scanning: { label: "Scanning…", tone: "live" },
  pending: { label: "Pending", tone: "idle" },
  waiting: { label: "Waiting…", tone: "idle" },
  queued: { label: "Queued", tone: "idle" },
};
