/**
 * What this deployment can measure about itself, and what it cannot.
 *
 * The AI Health screen used to read a single row written by the installer:
 * 24% CPU, 41% memory, a 98% success rate, 94% detection accuracy and a 3%
 * false-positive rate. Nothing measured any of it, nothing ever wrote a
 * second row, and the screen graded itself "excellent" off three of those
 * constants. On a screen whose whole purpose is to report measurements, and
 * where detection accuracy and the false-positive rate are the two figures a
 * customer would most want to trust.
 *
 * So this measures the machine and counts the record, and returns null for
 * everything else. Detection accuracy and the false-positive rate are always
 * null: they come from a benchmark that runs in the engine's CI and is not on
 * any route, so this app cannot know them. The screen says that in words
 * rather than leaving a gap somebody fills in with an assumption.
 */

import os from "os";
import { storage } from "./storage-unified";
import * as engine from "./engine";
import type { InsertAIHealthMetric } from "@shared/schema";

/** How often a sample is written while the server is running. */
const SAMPLE_EVERY_MS = 60_000;

/**
 * A rolling mean of this server's own API response times.
 *
 * Bounded and reset each sample, so it describes the last interval rather
 * than the whole uptime -- an average since boot stops moving after a day and
 * a number that cannot change is not a monitor.
 */
let responseTotalMs = 0;
let responseCount = 0;

export function recordResponseTime(ms: number): void {
  responseTotalMs += ms;
  responseCount += 1;
}

function takeAverageResponseTime(): number | null {
  if (responseCount === 0) return null;
  const mean = Math.round(responseTotalMs / responseCount);
  responseTotalMs = 0;
  responseCount = 0;
  return mean;
}

/**
 * Process CPU as a percentage of one core, over the interval since the last
 * call. process.cpuUsage() is cumulative microseconds, so a single reading is
 * "CPU since boot" and says nothing about now.
 */
let lastCpu = process.cpuUsage();
let lastCpuAt = Date.now();

function cpuPercent(): number {
  const now = Date.now();
  const delta = process.cpuUsage(lastCpu);
  const elapsedMs = Math.max(1, now - lastCpuAt);
  lastCpu = process.cpuUsage();
  lastCpuAt = now;
  const usedMs = (delta.user + delta.system) / 1000;
  const cores = Math.max(1, os.cpus().length);
  return Math.max(0, Math.min(100, Math.round((usedMs / (elapsedMs * cores)) * 100)));
}

function memoryPercent(): number {
  const total = os.totalmem();
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((process.memoryUsage().rss / total) * 100)));
}

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** One reading. Everything in it was measured or counted, or it is null. */
export async function measure(): Promise<InsertAIHealthMetric> {
  // Sample rows are excluded from every count here. The installer seeds three
  // tests, one of them in progress, and counting those as work this
  // deployment did would put "1 scan running, 3 today" on a machine that has
  // scanned nothing -- the same fiction the sample-data notice exists to stop
  // the dashboard telling.
  const tests = (await storage.getAllTests()).filter((test) => !test.isSample);
  const midnight = startOfToday();

  const active = tests.filter((test) => test.status === "in-progress").length;
  const today = tests.filter((test) => test.startedAt.getTime() >= midnight).length;

  // Of the scans that finished, how many finished rather than failed. Null
  // until something has finished: 100% of nothing is not a success rate.
  const completed = tests.filter((test) => test.status === "completed").length;
  const failed = tests.filter((test) => test.status === "failed").length;
  const finished = completed + failed;

  const classifiers = await storage.getAllClassifiers();
  const loaded = classifiers.filter((one) => one.status === "active");
  // The most recent training date anybody recorded, not "now" and not null
  // when one exists.
  const trained = loaded
    .map((one) => one.lastTrainedAt)
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  // The engine's boot canary: how many detection guards answered and how many
  // failed. This is the one real statement about detection either side of the
  // wire can make, and it is worth more than an accuracy figure nobody
  // computed.
  let guardsChecked: number | null = null;
  let guardsFailing: number | null = null;
  try {
    const status = await engine.status();
    const guards = (status.health as { guards?: { checked?: number; failing?: number } } | null)
      ?.guards;
    if (guards && typeof guards.checked === "number") guardsChecked = guards.checked;
    if (guards && typeof guards.failing === "number") guardsFailing = guards.failing;
  } catch {
    // An engine that is not there is a fact about the deployment. It leaves
    // these null; it does not fail the sample or invent a number.
  }

  return {
    cpuUsage: cpuPercent(),
    memoryUsage: memoryPercent(),
    activeScans: active,
    totalScansToday: today,
    successRate: finished > 0 ? Math.round((completed / finished) * 100) : null,
    averageResponseTime: takeAverageResponseTime(),
    modelsLoaded: loaded.map((one) => one.name),
    lastTrainingDate: trained,
    // Deliberately absent. See the note at the top of this file.
    detectionAccuracy: null,
    falsePositiveRate: null,
    guardsChecked,
    guardsFailing,
  };
}

let timer: NodeJS.Timeout | null = null;

/**
 * Start writing a sample every minute, so the trend charts have something
 * real to draw. One is taken immediately, because a screen opened in the
 * first minute of uptime should not be empty.
 */
export function startSampling(): void {
  if (timer) return;
  const write = async () => {
    try {
      await storage.createAIHealthMetric(await measure());
    } catch (cause) {
      // Never take the server down over a metric.
      console.warn("[health] could not record a sample:", cause);
    }
  };
  void write();
  timer = setInterval(write, SAMPLE_EVERY_MS);
  // Do not hold the process open for the sake of a metric.
  timer.unref?.();
}

export function stopSampling(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
