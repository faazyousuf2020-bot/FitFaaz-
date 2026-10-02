// Workout time and calories. Calories = MET × body weight (kg) × hours.
import { categoryOf, metOf } from "./categories";
import type { Category, ExerciseMeta, LiveSession, Session, Workout } from "./types";

export const REST_MET = 2; // standing / recovering between sets

/** Seconds of actual exercise for a logged row (measured when timed, otherwise estimated). */
export function activeSecs(w: Workout): number {
  if (w.active != null) return w.active;
  const sets = Math.max(1, w.sets || 1);
  if (!w.reps && w.dur) return w.dur * (w.sets > 1 ? w.sets : 1);
  return sets * Math.max(20, (w.reps || 0) * 3);
}
/** Estimated rest for an untimed row: about 1.5 minutes per set including the set itself. */
export function restEstimate(w: Workout): number {
  const sets = Math.max(1, w.sets || 1);
  const per = activeSecs(w) / sets;
  return sets * Math.max(30, 90 - per);
}

export type DayWorkout = {
  secs: number; active: number; rest: number; kcal: number;
  estimated: boolean; // some of it was estimated from sets (no timer)
  byCat: Record<string, number>; // active seconds per category
};

export function dayWorkout(
  date: string, workouts: Workout[], sessions: Session[], cats: Category[], meta: Record<string, ExerciseMeta>,
  kg: number, live?: LiveSession | null, now = Date.now(),
): DayWorkout {
  const out: DayWorkout = { secs: 0, active: 0, rest: 0, kcal: 0, estimated: false, byCat: {} };
  const rows = workouts.filter((w) => w.date === date);
  const daySessions = sessions.filter((s) => s.date === date);
  const sessionIds = new Set(daySessions.map((s) => s.id));
  if (live) sessionIds.add(live.id);
  const kcalFor = (w: Workout, secs: number) => {
    const cat = categoryOf(w.name, meta, w.kg);
    out.byCat[cat ?? "other"] = (out.byCat[cat ?? "other"] ?? 0) + secs;
    return (metOf(cat, cats) * kg * secs) / 3600;
  };

  const sessionBlocks: { id: string; secs: number }[] = daySessions.map((s) => ({ id: s.id, secs: s.secs }));
  if (live && new Date(live.startedAt).toDateString() === new Date(date + "T00:00:00").toDateString()) {
    sessionBlocks.push({ id: live.id, secs: (now - live.startedAt) / 1000 });
  }
  for (const s of sessionBlocks) {
    const inside = rows.filter((w) => w.session_id === s.id);
    let active = 0;
    for (const w of inside) {
      const a = activeSecs(w);
      if (w.active == null) out.estimated = true;
      active += a;
      out.kcal += kcalFor(w, a);
    }
    const secs = Math.max(s.secs, active);
    const rest = secs - active;
    out.kcal += (REST_MET * kg * rest) / 3600;
    out.secs += secs; out.active += active; out.rest += rest;
  }
  for (const w of rows.filter((w) => !w.session_id || !sessionIds.has(w.session_id))) {
    const a = activeSecs(w), r = w.rest ?? restEstimate(w);
    if (w.active == null) out.estimated = true;
    out.kcal += kcalFor(w, a) + (REST_MET * kg * r) / 3600;
    out.secs += a + r; out.active += a; out.rest += r;
  }
  return out;
}
