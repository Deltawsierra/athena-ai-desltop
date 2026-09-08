/**
 * The classifiers: which models are loaded, and how good anybody has shown
 * them to be.
 *
 * This page used to accept a paragraph of text, wait a second and a half on a
 * timer, and answer "SQL Injection, 92% confident" -- the same label and the
 * same number whatever was typed into it, both written into the source. A
 * confidence figure is the most load-bearing number a security product
 * displays, and that one was decoration.
 *
 * There is no classification endpoint on the engine yet, so this does not
 * offer classification. It shows the registry instead: every model recorded,
 * its measured accuracy, the size of the set that measurement came from, and
 * when it was last trained. That is a smaller claim and it is one the app can
 * actually support, and it happens to answer the question a technical visitor
 * asks anyway -- how good is it, and measured how?
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Boxes, CircleSlash, FlaskConical } from "lucide-react";

import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import type { Classifier } from "@shared/schema";

/**
 * Where a measured accuracy stops being a good number.
 *
 * Stated rather than felt, because "94%" means nothing without a threshold
 * beside it and every reader invents a different one.
 */
const GOOD_ENOUGH = 90;

function accuracyColour(accuracy: number): string {
  if (accuracy >= GOOD_ENOUGH) return "hsl(var(--primary))";
  if (accuracy >= 75) return "hsl(var(--sev-medium))";
  return "hsl(var(--sev-high))";
}

export default function CVEClassifier() {
  const { data: classifiers = [], isLoading } = useQuery<Classifier[]>({
    queryKey: ["/api/classifiers"],
  });

  const active = useMemo(
    () => classifiers.filter((one) => one.status === "active"),
    [classifiers],
  );

  // Weighted by the size of each training set, because an average over models
  // trained on 200 samples and 200,000 samples is not a number about anything.
  const weighted = useMemo(() => {
    const total = active.reduce((sum, one) => sum + one.trainingDataSize, 0);
    if (total === 0) return null;
    const sum = active.reduce(
      (acc, one) => acc + one.accuracy * one.trainingDataSize, 0,
    );
    return sum / total;
  }, [active]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <PageHeader
          title="Classifiers"
          icon={<Boxes className="w-8 h-8 text-primary" />}
          description="Every model this deployment has loaded, with the accuracy somebody measured and the set they measured it on."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="athena-label">Active models</div>
            <div className="athena-figure text-4xl mt-1" data-testid="text-active-count">
              {active.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {classifiers.length} recorded
            </p>
          </GlassCard>

          <GlassCard className="md:col-span-2">
            <div className="athena-label">Accuracy, weighted by training set</div>
            {weighted === null ? (
              <p className="text-sm text-muted-foreground mt-2">
                No active model has a training set recorded, so there is nothing
                to weight and no figure to give.
              </p>
            ) : (
              <>
                <div
                  className="athena-figure text-4xl mt-1"
                  style={{ color: accuracyColour(weighted) }}
                  data-testid="text-weighted-accuracy"
                >
                  {weighted.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  A plain average over models trained on very different amounts
                  of data is not a number about anything, so this is weighted by
                  the size of each set.
                </p>
              </>
            )}
          </GlassCard>
        </div>

        {!isLoading && classifiers.length === 0 && (
          <GlassCard ruling>
            <div className="flex gap-3 items-start">
              <CircleSlash className="w-5 h-5 mt-0.5 athena-gold shrink-0" />
              <div className="space-y-1">
                <div className="athena-label">No classifiers recorded</div>
                <p className="text-sm text-muted-foreground">
                  Nothing has been registered yet. This page shows what is
                  loaded rather than what could be, so it stays empty until
                  something is.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {classifiers.length > 0 && (
          <div className="space-y-3" data-testid="list-classifiers">
            {classifiers.map((one) => (
              <GlassCard key={one.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{one.name}</span>
                      <span className="athena-mono text-xs text-muted-foreground">
                        {one.type}
                      </span>
                      {one.status !== "active" && (
                        <span className="athena-label" style={{ color: "hsl(var(--sev-info))" }}>
                          {one.status}
                        </span>
                      )}
                    </div>
                    {one.description && (
                      <p className="text-sm text-muted-foreground">
                        {one.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-6 shrink-0">
                    <div>
                      <div className="athena-label">Accuracy</div>
                      <div
                        className="athena-figure text-2xl"
                        style={{ color: accuracyColour(one.accuracy) }}
                        data-testid={`text-accuracy-${one.id}`}
                      >
                        {one.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="athena-label">Trained on</div>
                      <div className="athena-figure text-2xl">
                        {one.trainingDataSize.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  {one.lastTrainedAt ? (
                    <span>
                      last trained{" "}
                      {formatDistanceToNow(new Date(one.lastTrainedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    // Not "never trained": nobody wrote down when, which is a
                    // different thing and the only one this row can support.
                    <span>no training date recorded</span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <GlassCard className="athena-fluted">
          <div className="athena-label">Classifying something</div>
          <p className="text-sm text-muted-foreground mt-2">
            Classification runs in the engine, not in this app, and there is no
            route for it yet. When there is, it will appear here and its answer
            will be the engine's — including its confidence, which is a
            measurement and not a flourish.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
