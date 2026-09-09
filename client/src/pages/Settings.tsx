/**
 * Settings: the environment's own configuration -- who it connects to, what it
 * defaults to, how long it keeps data, and the guardrails Mythos recommends
 * kept on. Presentational fixture UI; controls are inert until wired.
 */
import {
  Link2,
  ShieldCheck,
  Lock,
  Clock,
  Settings as Cog,
  Shield,
  Plug,
  ScanLine,
  Bell,
  Database,
  CheckCircle2,
  Users,
  Boxes,
  ChevronRight,
  ChevronDown,
  Plus,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageHero from "@/components/mythos/PageHero";
import StatCard from "@/components/mythos/StatCard";
import GlassCard from "@/components/GlassCard";
import { Divider } from "@/components/mythos/Ornament";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "General", icon: Cog },
  { label: "Security", icon: Shield },
  { label: "Integrations", icon: Plug },
  { label: "Scan Defaults", icon: ScanLine },
  { label: "Notifications", icon: Bell },
  { label: "Data Handling", icon: Database },
  { label: "Approvals", icon: CheckCircle2 },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-foreground">
        {value}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    </label>
  );
}
function Input({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="block rounded-lg border border-border/60 bg-surface-1/50 px-3 py-2 text-[13px] text-foreground">{value}</span>
    </label>
  );
}
function Toggle({ on, label }: { on: boolean; label: string }) {
  const [v, setV] = useState(on);
  return (
    <button type="button" role="switch" aria-checked={v} onClick={() => setV((x) => !x)} className="flex items-center gap-2.5 text-left">
      <span className={cn("inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", v ? "bg-gold" : "bg-surface-2")}>
        <span className={cn("h-4 w-4 rounded-full bg-white transition-transform", v && "translate-x-4")} />
      </span>
      <span className="text-[12px] text-foreground">{label}</span>
    </button>
  );
}
function Radio({ on, label, onSelect }: { on: boolean; label: string; onSelect?: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onSelect} className="flex w-full items-center gap-2.5 text-left">
      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors", on ? "border-primary" : "border-border/70")}>
        {on && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span className="text-[12px] text-foreground">{label}</span>
    </button>
  );
}
function CardHead({ icon: Icon, title, blurb }: { icon: typeof Cog; title: string; blurb: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-dim/40 bg-gold/5 text-gold"><Icon className="h-5 w-5" /></span>
      <div>
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{blurb}</p>
      </div>
    </div>
  );
}

const ROUTING = [
  "Use primary provider (recommended)",
  "Auto-failover on error",
  "Route by data classification",
  "Custom routing rules",
];

const API_KEYS = [
  { name: "prod-scanner", perms: "Scan, Read", created: "Jan 12, 2025" },
  { name: "ci-cd-pipeline", perms: "Deploy, Read", created: "Feb 3, 2025" },
  { name: "analytics", perms: "Read", created: "Mar 18, 2025" },
];

type GuideTone = "ok" | "warn";
const GUIDANCE: { tone: GuideTone; title: string; note: string }[] = [
  { tone: "ok", title: "Secure defaults enabled", note: "Your configuration aligns with Mythos security best practices." },
  { tone: "warn", title: "Consider enabling human approval for high-risk deployments", note: "You have 1 high-risk scenario without approval gates." },
  { tone: "warn", title: "Data retention is set to 365 days", note: "Consider a shorter retention period if not required for compliance." },
  { tone: "ok", title: "SSO is enabled", note: "Your organization uses SAML SSO." },
  { tone: "ok", title: "Training data reuse is disabled", note: "Good — customer data will not be used for model training." },
];

interface ConnField { field: string; secret: boolean; source: string; set: boolean; env: string }
interface Connections { fields: ConnField[] }
interface EngineStatus { configured: boolean; reachable: boolean; authorized: boolean | null; url: string | null; detail: string }

export default function Settings() {
  const { data: conn } = useQuery<Connections>({ queryKey: ["/api/settings/connections"] });
  const { data: engine } = useQuery<EngineStatus>({ queryKey: ["/api/engine/status"] });
  const [tab, setTab] = useState("General");
  const [routing, setRouting] = useState(ROUTING[0]);

  const fields = conn?.fields ?? [];
  const setCount = fields.filter((f) => f.set).length;
  const engineOk = engine?.configured && engine?.reachable && engine?.authorized !== false;

  const guidance: { tone: GuideTone; title: string; note: string }[] = [
    engine?.configured
      ? engineOk
        ? { tone: "ok", title: "Engine is connected", note: `Reachable at ${engine?.url ?? "the configured address"} and authorized.` }
        : { tone: "warn", title: "Engine configured but not reachable", note: engine?.detail ?? "Check the engine address and operator key." }
      : { tone: "warn", title: "No engine is configured", note: "Set the engine address and an operator key below (or ATHENA_ENGINE_URL / ATHENA_ENGINE_KEY) before scanning." },
    ...GUIDANCE,
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <PageHero
        title="Settings"
        subtitle="Configure your environment. Strengthen security. Enable responsible AI at scale."
        background="vista"
        verbs={["Trusted", "AI Adoption", "At Enterprise", "Scale"]}
      />
      <Divider variant="key" className="mt-5" />

      {/* stats -- integrations & engine live */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard layout="tile" label="Connected Integrations" value={`${setCount} / ${fields.length || 0}`} icon={Link2} sublabel="Connection fields configured" />
        <StatCard layout="tile" label="Engine" value={engineOk ? "Connected" : engine?.configured ? "Unreachable" : "Not set"} icon={ShieldCheck} sublabel={engine?.configured ? (engine?.url ?? "") : "No address configured"} />
        <StatCard layout="tile" label="Secure Defaults" value="Active" icon={Lock} sublabel="Aligned with Mythos recommendations" />
        <StatCard layout="tile" label="Approval Gates" value="4 / 5" icon={Clock} sublabel="Human oversight configured" />
      </div>

      {/* tabs -- switch which settings sections show */}
      <GlassCard hover={false} className="mt-5" bodyClassName="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.label;
          return (
            <button key={t.label} onClick={() => setTab(t.label)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors", active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </GlassCard>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {!["General", "Integrations", "Data Handling"].includes(tab) && (
            <GlassCard hover={false} className="lg:col-span-3">
              <p className="text-[13px] text-muted-foreground">The <span className="text-foreground">{tab}</span> section has no configurable settings in this build yet. General, Integrations, and Data Handling are wired.</p>
            </GlassCard>
          )}
          {tab === "General" && (
          <GlassCard hover={false}>
            <CardHead icon={Users} title="Organization & Tenant" blurb="Basic information and branding for your Mythos environment." />
            <div className="space-y-3">
              <Input label="Organization Name" value="Acme Financial" />
              <Field label="Environment" value="Production" />
              <div>
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground">Tenant Logo</span>
                <div className="flex items-center gap-3">
                  <span className="flex h-16 flex-1 items-center justify-center rounded-lg border border-border/60 bg-surface-1/50 font-serif text-[13px] tracking-widest text-gold">ACME FINANCIAL</span>
                  <div className="space-y-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[11px] text-foreground">Change Logo</button>
                    <span className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="h-4 w-4 rounded-full bg-gold" /> #D4AF37</span>
                  </div>
                </div>
              </div>
              <Field label="Time Zone" value="(UTC-5) Eastern Time (ET)" />
            </div>
          </GlassCard>
          )}

          {tab === "General" && (
          <GlassCard hover={false}>
            <CardHead icon={Cog} title="Platform Preferences" blurb="Customize your experience and default behavior." />
            <div className="space-y-3">
              <Field label="Default View" value="Athena Scan Results" />
              <Field label="Items per page" value="25" />
              <Field label="UI Theme" value="Mythos Dark" />
              <div className="space-y-3 border-t border-border/40 pt-3">
                <Toggle on label="Show risk score color indicators" />
                <Toggle on label="Enable advanced filters by default" />
                <Toggle on={false} label="Play sound for critical findings" />
              </div>
            </div>
          </GlassCard>
          )}

          {tab === "Integrations" && (
          <GlassCard hover={false}>
            <CardHead icon={Boxes} title="Model Routes & Providers" blurb="Configure default models and routing for scans and analysis." />
            <div className="space-y-3">
              <Field label="Primary LLM Provider" value="OpenAI" />
              <Field label="Default Model" value="GPT-4o" />
              <Field label="Fallback Provider" value="Anthropic — Claude 3.5 Sonnet" />
              <Field label="Embedding Model" value="text-embedding-3-large" />
              <div className="space-y-2.5 border-t border-border/40 pt-3" role="radiogroup" aria-label="Provider Routing">
                <span className="block text-[11px] font-medium text-muted-foreground">Provider Routing</span>
                {ROUTING.map((label) => (
                  <Radio key={label} label={label} on={routing === label} onSelect={() => setRouting(label)} />
                ))}
              </div>
            </div>
          </GlassCard>
          )}

          {tab === "Data Handling" && (
          <GlassCard hover={false}>
            <CardHead icon={Sparkles} title="Training & Feedback" blurb="Control how your data is used to improve model performance." />
            <Toggle on={false} label="Allow training/feedback reuse" />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">When enabled, de-identified data may be used to improve model performance. We recommend keeping this disabled for sensitive environments.</p>
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-border/50 bg-surface-1/40 px-3 py-2 text-[11px] text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> Customer data is not used for model training by default at Mythos.</p>
          </GlassCard>
          )}

          {tab === "Data Handling" && (
          <GlassCard hover={false}>
            <CardHead icon={Database} title="Data Retention" blurb="Manage how long data is stored in Mythos." />
            <div className="space-y-3">
              <Field label="Scan data retention" value="90 days" />
              <Field label="Evidence files" value="180 days" />
              <Field label="Audit logs" value="365 days" />
              <div className="border-t border-border/40 pt-3"><Toggle on label="Auto-delete expired data" /></div>
            </div>
          </GlassCard>
          )}

          {tab === "Integrations" && (
          <GlassCard hover={false}>
            <CardHead icon={Lock} title="Tenant API Keys" blurb="Manage API access for programmatic integrations." />
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
                    {["Name", "Permissions", "Created", "Status"].map((h) => <th key={h} className="px-2 py-1.5 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {API_KEYS.map((k) => (
                    <tr key={k.name} className="border-t border-border/40">
                      <td className="px-2 py-2 text-[12px] text-foreground">{k.name}</td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{k.perms}</td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{k.created}</td>
                      <td className="px-2 py-2"><span className="inline-flex items-center gap-1 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => alert("Create API Key — key provisioning is coming soon.")} className="mt-3 flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-foreground hover:border-primary/50"><Plus className="h-3.5 w-3.5" /> Create API Key</button>
          </GlassCard>
          )}
        </div>

        {/* right rail */}
        <GlassCard hover={false} ruling className="self-start">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="text-[15px] font-semibold text-foreground">Safe Configuration Guidance</p>
          </div>
          <p className="mb-4 text-[12px] text-muted-foreground">Mythos recommendations to keep your environment secure and compliant.</p>
          <ul className="space-y-3">
            {guidance.map((g) => (
              <li key={g.title} className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5", g.tone === "ok" ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-amber-500/25 bg-amber-500/[0.06]")}>
                {g.tone === "ok"
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />}
                <span>
                  <span className="block text-[12px] font-medium text-foreground">{g.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{g.note}</span>
                </span>
              </li>
            ))}
            <li className="flex items-start gap-2.5 rounded-lg border border-border/50 px-3 py-2.5">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                <span className="block text-[12px] font-medium text-foreground">Explore more guidance</span>
                <span className="block text-[11px] text-muted-foreground">View the Mythos Security Configuration Guide for detailed recommendations.</span>
              </span>
              <ChevronRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
