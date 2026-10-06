// Workout time and calories.
// Calories = (MET − 1) × body weight (kg) × hours. The "− 1" leaves out what the body burns at rest anyway,
// which is already inside the daily maintenance figure.
// Rest = only the gaps between sets (each gap capped at 5 minutes). Time before the first set, after the
// last set, or long breaks is not counted, so forgetting to tap Finish doesn't add calories.
import { categoryOf, metOf } from "./categories";
import type { Category, ExerciseMeta, LiveSession, Session, Workout } from "./types";

export const REST_MET = 2; // standing / recovering between sets
export const MAX_REST = 300; // a gap longer than 5 minutes counts as 5 minutes of rest

const net = (met: number) => Math.max(0, met - 1);
export const kcalFor = (met: number, kg: number, secs: number) => (net(met) * kg * secs) / 3600;

/** Seconds of actual exercise for a logged row (measured when timed, otherwise estimated). */
export function activeSecs(w: Workout): number {
  if (w.active != null) return w.active;
  const sets = Math.max(1, w.sets || 1);
  if (!w.reps && w.dur) return w.dur * (w.sets > 1 ? w.sets : 1);
  return sets * Math.max(20, (w.reps || 0) * 3);
}
/** Rest counted for a row: the measured gap before a timed set, or about 1 minute between untimed sets. */
export function restSecs(w: Workout): number {
  if (w.active != null) return Math.min(w.rest ?? 0, MAX_REST);
  return Math.max(0, Math.max(1, w.sets || 1) - 1) * 60;
}

export type DayWorkout = {
  secs: number; active: number; rest: number; kcal: number;
  estimated: boolean; // some of it was estimated from sets (no timer)
  byCat: Record<string, number>; // active seconds per category
};

/** Live numbers for a running session: the set in progress, or the rest since the last set. */
export function liveExtra(live: LiveSession | null | undefined, now = Date.now()) {
  if (!live) return { active: 0, rest: 0 };
  if (live.setStartedAt) return { active: Math.max(0, (now - live.setStartedAt) / 1000), rest: 0 };
  if (live.lastSetEndedAt) return { active: 0, rest: Math.min(MAX_REST, Math.max(0, (now - live.lastSetEndedAt) / 1000)) };
  return { active: 0, rest: 0 };
}

export function dayWorkout(
  date: string, workouts: Workout[], _sessions: Session[], cats: Category[], meta: Record<string, ExerciseMeta>,
  kg: number, live?: LiveSession | null, now = Date.now(),
): DayWorkout {
  const out: DayWorkout = { secs: 0, active: 0, rest: 0, kcal: 0, estimated: false, byCat: {} };
  for (const w of workouts.filter((x) => x.date === date)) {
    const cat = categoryOf(w.name, meta, w.kg);
    const a = activeSecs(w), r = restSecs(w);
    if (w.active == null) out.estimated = true;
    out.byCat[cat ?? "other"] = (out.byCat[cat ?? "other"] ?? 0) + a;
    out.kcal += kcalFor(metOf(cat, cats), kg, a) + kcalFor(REST_MET, kg, r);
    out.active += a; out.rest += r;
  }
  // the set or rest happening right now
  if (live && new Date(live.startedAt).toDateString() === new Date(date + "T00:00:00").toDateString()) {
    const x = liveExtra(live, now);
    const cat = live.current ? categoryOf(live.current, meta) : null;
    out.kcal += kcalFor(metOf(cat, cats), kg, x.active) + kcalFor(REST_MET, kg, x.rest);
    out.active += x.active; out.rest += x.rest;
  }
  out.secs = out.active + out.rest;
  return out;
}

/** Totals for one session's rows (used for the summary when you tap Finish). */
export function sessionTotals(rows: Workout[], cats: Category[], meta: Record<string, ExerciseMeta>, kg: number) {
  let active = 0, rest = 0, kcal = 0;
  for (const w of rows) {
    const a = activeSecs(w), r = restSecs(w);
    active += a; rest += r;
    kcal += kcalFor(metOf(categoryOf(w.name, meta, w.kg), cats), kg, a) + kcalFor(REST_MET, kg, r);
  }
  return { active, rest, secs: active + rest, kcal };
}
