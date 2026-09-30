import type { Exercise, PlanItem, Walk, Workout } from "./types";
import { fmtDur, n0, pct, sum } from "./util";

const DUR: Record<string, number> = {
  s: 1, sec: 1, secs: 1, second: 1, seconds: 1,
  m: 60, min: 60, mins: 60, minute: 60, minutes: 60,
  h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600,
};
const durRe = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${Object.keys(DUR).sort((a, b) => b.length - a.length).join("|")})\\b`);
export const exKey = (n: string) => n.toLowerCase().replace(/[\s\-_]/g, "").replace(/s$/, "");
export const isWalk = (n: string) => exKey(n).startsWith("walk");

export function parseWo(text: string, known: string[]): Exercise {
  let t = " " + text.toLowerCase().trim() + " ";
  let sets = 0, reps = 0, dur = 0, kg = 0;
  let m: RegExpMatchArray | null;
  if ((m = t.match(/(\d+)\s*[x×*]\s*(\d+)/))) { sets = +m[1]; reps = +m[2]; t = t.replace(m[0], " "); }
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*kgs?\b/))) { kg = +m[1]; t = t.replace(m[0], " "); }
  while ((m = t.match(durRe))) { dur += +m[1] * DUR[m[2]]; t = t.replace(m[0], " "); }
  if (!reps && (m = t.match(/\b(\d+)\s*(?:reps?)?\b/))) { sets = 1; reps = +m[1]; t = t.replace(m[0], " "); }
  t = t.replace(/\breps?\b|\bsets?\b/g, " ");
  let name = t.trim().replace(/\s+/g, " ");
  const prev = known.find((k) => exKey(k) === exKey(name));
  if (prev) name = prev;
  return { name, sets, reps, dur, kg };
}
export const validEx = (p: Exercise) => !!p.name && (p.reps > 0 || p.dur > 0);

export const woDesc = (w: Exercise) =>
  [
    w.reps ? (w.sets > 1 ? `${w.sets}×${w.reps}` : `${w.reps} reps`) : "",
    w.kg ? `${w.kg} kg` : "",
    w.dur ? fmtDur(w.dur) : "",
  ].filter(Boolean);

export type Metric = { label: string; get: (r: Workout) => number; show: (v: number) => string; fmt: (v: number) => string };
export function exMetric(rows: Workout[]): Metric {
  const weighted = rows.some((r) => r.kg), timed = rows.every((r) => !r.reps && r.dur);
  const short = (v: number) => (v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(Math.round(v)));
  if (weighted) return { label: "Volume (reps × kg)", get: (r) => r.sets * r.reps * (r.kg || 1), show: (v) => `${n0(v)} kg lifted`, fmt: short };
  if (timed) return { label: "Time held", get: (r) => r.dur, show: (v) => fmtDur(v), fmt: (v) => `${Math.round(v)}s` };
  return { label: "Total reps per session", get: (r) => r.sets * r.reps, show: (v) => `${n0(v)} reps`, fmt: short };
}

export function exTrend(all: Workout[], name: string, from: string) {
  const rows = all.filter((w) => exKey(w.name) === exKey(name) && w.date >= from);
  const days = [...new Set(rows.map((r) => r.date))].sort();
  if (days.length < 2) return null;
  const M = exMetric(rows), vals = days.map((d) => sum(rows.filter((r) => r.date === d), M.get));
  const k = Math.min(3, Math.floor(vals.length / 2));
  const firstAvg = sum(vals.slice(0, k), (v) => v) / k, lastAvg = sum(vals.slice(-k), (v) => v) / k, best = Math.max(...vals);
  return { pct: pct(lastAvg, firstAvg), firstAvg, lastAvg, best, k, recentDrop: lastAvg < best * 0.9 && vals.length >= 5 };
}

export type PlanStatus = "done" | "part" | "miss" | "todo";
export function planStatus(
  date: string, item: PlanItem, todayISO: string,
  walks: Walk[], workouts: Workout[], liveWalkSecs: number,
): PlanStatus {
  let target: number, actual: number;
  if (isWalk(item.name)) {
    target = item.dur || 1800;
    actual = sum(walks.filter((w) => w.date === date), (w) => w.secs) + (date === todayISO ? liveWalkSecs : 0);
  } else {
    const rows = workouts.filter((w) => w.date === date && exKey(w.name) === exKey(item.name));
    if (item.reps) { target = item.sets * item.reps; actual = sum(rows, (r) => r.sets * r.reps); }
    else { target = item.dur; actual = sum(rows, (r) => r.dur); }
  }
  if (actual >= target) return "done";
  if (actual > 0) return "part";
  return date < todayISO ? "miss" : "todo";
}
