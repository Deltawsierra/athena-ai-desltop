/**
 * Where this deployment talks to, and with what.
 *
 * Until now the engine's address and the assistant's endpoint were
 * environment variables and nothing else, which is fine for a server and
 * useless for a desktop application: a packaged Electron build has no shell
 * to set them in, so both shipped permanently disconnected with no way in the
 * product to connect them. Two screens said "not connected" and were right,
 * and there was nothing anybody could do about it from inside the app.
 *
 * Saving also answers. Until now this screen said "Saved. The new settings
 * are in force now." and stopped -- true, and not the thing anybody wants to
 * know. A typo in the port, an engine that is not running, a key that was
 * revoked: all of them saved cleanly and were discovered two screens later,
 * or at the first scan. Each connection now states what it is doing, checked
 * against the thing itself, and rechecks the moment a field is saved.
 *
 * A key is never shown. The screen is told whether one is set, and typing a
 * new one replaces it -- there is no state in which this page can display a
 * credential, because there is no state in which it has one. Leaving a key
 * field blank keeps what is stored; the button beside it is how you remove
 * one, which has to be expressible or a key pasted in by mistake is
 * permanent.
 */

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, CircleHelp, KeyRound, Link2, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Source = "stored" | "environment" | "unset";

interface Field {
  field: string;
  secret: boolean;
  source: Source;
  set: boolean;
  value: string | null;
  env: string;
}

const LABELS: Record<string, { label: string; hint: string }> = {
  engineUrl: {
    label: "Engine address",
    hint: "The Mythos engine that runs the scans. Nothing on the penetration testing screen works without it.",
  },
  engineKey: {
    label: "Engine operator key",
    hint: "Issued by the engine. It carries the tenant a scan is recorded against.",
  },
  assistantUrl: {
    label: "Assistant endpoint",
    hint: "An OpenAI-compatible chat completions base URL. Leave empty and the chat screen keeps a record and answers nothing.",
  },
  assistantKey: {
    label: "Assistant key",
    hint: "Sent as a bearer token. Some self-hosted endpoints need none.",
  },
  assistantModel: {
    label: "Assistant model",
    hint: "Defaults to gpt-4o-mini when empty.",
  },
};

interface EngineStatus {
  configured: boolean;
  reachable: boolean;
  authorized: boolean | null;
  url: string | null;
  detail: string;
}

interface AssistantStatus {
  configured: boolean;
  reachable: boolean;
  model: string | null;
  detail: string;
}

type Verdict = "good" | "bad" | "unknown";

const VERDICT_STYLE: Record<Verdict, { icon: typeof CircleCheck; colour: string }> = {
  good: { icon: CircleCheck, colour: "hsl(var(--primary))" },
  bad: { icon: CircleAlert, colour: "hsl(var(--sev-high))" },
  unknown: { icon: CircleHelp, colour: "hsl(var(--gold))" },
};

/**
 * What this connection is actually doing, in one line.
 *
 * `unknown` is a real answer and gets its own colour. Rounding "could not
 * tell" up to a green tick is how a screen ends up reassuring somebody about
 * something it never checked.
 */
function Connection({
  verdict, summary, detail, testId,
}: {
  verdict: Verdict;
  summary: string;
  detail: string;
  testId: string;
}) {
  const { icon: Icon, colour } = VERDICT_STYLE[verdict];
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-3"
      style={{ borderColor: `color-mix(in srgb, ${colour} 30%, transparent)` }}
      data-testid={testId}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: colour }} />
      <div className="min-w-0 space-y-1">
        <div className="athena-label" style={{ color: colour }}>{summary}</div>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function sourceNote(field: Field): string | null {
  if (field.source === "environment") {
    return `In force from ${field.env} in the environment. Saving here overrides it.`;
  }
  return null;
}

export default function Settings() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ fields: Field[] }>({
    queryKey: ["/api/settings/connections"],
  });

  // The engine is asked, not described: /health for liveness and an
  // operator-only route for the key. Polled, because an engine comes and goes
  // independently of this app and a status that was true when the page loaded
  // is not a status.
  const engine = useQuery<EngineStatus>({
    queryKey: ["/api/engine/status"],
    refetchInterval: 30_000,
  });
  const assistant = useQuery<AssistantStatus>({ queryKey: ["/api/assistant/status"] });

  // Non-secret values are shown as they are; secrets start empty, because the
  // server never sends one and there is nothing to prefill.
  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const field of data.fields) next[field.field] = field.value ?? "";
    setDraft(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const response = await apiRequest("PATCH", "/api/settings/connections", updates);
      return (await response.json()) as { fields: Field[] };
    },
    onSuccess: () => {
      // Both status banners read from these, so they are refreshed together.
      queryClient.invalidateQueries({ queryKey: ["/api/settings/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/engine/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/status"] });
      toast({ title: "Saved", description: "The new settings are in force now." });
    },
    onError: (error: Error) => {
      toast({
        title: "Not saved",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fields = data?.fields ?? [];
  const group = (names: string[]) => fields.filter((one) => names.includes(one.field));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const updates: Record<string, string> = {};
    for (const field of fields) {
      const typed = draft[field.field] ?? "";
      // A blank secret means "leave what is stored alone", not "clear it".
      // Clearing is the button, so that a slip of the keyboard cannot
      // disconnect a deployment.
      if (field.secret && typed === "") continue;
      updates[field.field] = typed;
    }
    save.mutate(updates);
  };

  const clear = (name: string) => {
    setDraft((current) => ({ ...current, [name]: "" }));
    save.mutate({ [name]: "" });
  };

  const renderField = (field: Field) => {
    const meta = LABELS[field.field] ?? { label: field.field, hint: "" };
    const note = sourceNote(field);
    return (
      <div key={field.field} className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={field.field}>{meta.label}</Label>
          {field.secret && field.set && (
            <button
              type="button"
              onClick={() => clear(field.field)}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              data-testid={`button-clear-${field.field}`}
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
        <Input
          id={field.field}
          type={field.secret ? "password" : "text"}
          autoComplete="off"
          spellCheck={false}
          value={draft[field.field] ?? ""}
          onChange={(event) =>
            setDraft((current) => ({ ...current, [field.field]: event.target.value }))
          }
          placeholder={
            field.secret
              ? field.set
                ? "A key is set. Type a new one to replace it."
                : "No key set"
              : ""
          }
          data-testid={`input-${field.field}`}
        />
        <p className="text-xs text-muted-foreground">{meta.hint}</p>
        {note && (
          <p className="text-xs athena-gold" data-testid={`text-source-${field.field}`}>
            {note}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-3xl">
        <PageHeader
          title="Settings"
          icon={<Link2 className="w-8 h-8 text-primary" />}
          description="Where this deployment talks to, and with what. These fields decide which engine scans a customer and which third party sees a summary of what was found."
        />

        <form onSubmit={submit} className="space-y-6">
          <GlassCard>
            <div className="space-y-5">
              <div className="athena-label">The engine</div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Reading…</p>
              ) : (
                group(["engineUrl", "engineKey"]).map(renderField)
              )}
              {engine.data && (
                <Connection
                  testId="status-engine"
                  verdict={
                    !engine.data.reachable
                      ? "bad"
                      : engine.data.authorized === true
                        ? "good"
                        : engine.data.authorized === false
                          ? "bad"
                          : "unknown"
                  }
                  summary={
                    !engine.data.configured
                      ? "Not configured"
                      : !engine.data.reachable
                        ? "Not reachable"
                        : engine.data.authorized === true
                          ? "Connected"
                          : engine.data.authorized === false
                            ? "Reachable, key refused"
                            : "Reachable, key not checked"
                  }
                  detail={engine.data.detail}
                />
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-5">
              <div className="athena-label">The assistant</div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Reading…</p>
              ) : (
                group(["assistantUrl", "assistantKey", "assistantModel"]).map(renderField)
              )}
              {assistant.data && (
                <Connection
                  testId="status-assistant"
                  // Never "good": a completions endpoint has no free health
                  // check, so this says what is configured and does not
                  // pretend to have asked it anything. Never "bad" either --
                  // an assistant is optional, and painting its absence red
                  // says something is broken when nothing is. The engine is
                  // the one whose absence stops work.
                  verdict="unknown"
                  summary={
                    assistant.data.configured
                      ? `Configured as ${assistant.data.model}`
                      : "Not configured"
                  }
                  detail={assistant.data.detail}
                />
              )}
            </div>
          </GlassCard>

          <GlassCard ruling>
            <div className="flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 mt-0.5 athena-gold shrink-0" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="athena-label">Where these are kept</div>
                <p>
                  Keys are stored in this machine's Athena database, as
                  written. Encrypting them with something else on the same disk
                  would be theatre — anything the app can decrypt unattended,
                  so can anyone holding the file — so the file's own
                  permissions are what protect them. They are never sent back
                  to this screen: it is told whether a key is set, not what it
                  is.
                </p>
                <p>
                  Pointing the assistant at a hosted provider sends a summary
                  of this deployment to that provider. The chat screen says
                  exactly what, above the composer.
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={save.isPending} data-testid="button-save-settings">
              <KeyRound className="w-4 h-4 mr-2" />
              {save.isPending ? "Saving…" : "Save"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Takes effect immediately. No restart.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
