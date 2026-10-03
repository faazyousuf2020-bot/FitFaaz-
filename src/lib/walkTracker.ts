import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { db, getSetting, setSetting } from "./db";
import type { ActiveWalk, Profile } from "./types";
import { haversine, nowHM, today, uid } from "./util";

export const WALK_TASK = "fitfaaz-walk-location";
const MAX_ACC = 30; // ignore fixes worse than this (metres)
const MIN_MOVE = 4; // ignore jitter smaller than this (metres)
const MAX_SPEED = 7; // m/s — anything faster is a GPS jump

type LocData = { locations?: Location.LocationObject[] };

// Must be defined at module scope so it is registered when the app (or the headless task) starts.
TaskManager.defineTask<LocData>(WALK_TASK, async ({ data, error }) => {
  if (error || !data?.locations?.length) return;
  const w = getSetting<ActiveWalk | null>("activeWalk", null);
  if (!w || w.status !== "walking") return;
  for (const l of data.locations) {
    db.runSync(
      "INSERT INTO walk_points (seg, lat, lng, acc, t) VALUES (?, ?, ?, ?, ?)",
      w.seg, l.coords.latitude, l.coords.longitude, l.coords.accuracy ?? 999, l.timestamp,
    );
  }
});

export type Pt = { seq: number; seg: number; lat: number; lng: number; acc: number; t: number };

/** Incremental distance calculator over the stored GPS points. */
export class Odometer {
  lastSeq = 0;
  m = 0;
  route: [number, number][] = [];
  lastAcc: number | null = null;
  private lastBySeg = new Map<number, Pt>();
  feed(pts: Pt[]) {
    for (const p of pts) {
      this.lastSeq = p.seq;
      this.lastAcc = p.acc;
      if (p.acc > MAX_ACC) continue;
      const prev = this.lastBySeg.get(p.seg);
      if (!prev) { this.lastBySeg.set(p.seg, p); this.route.push([p.lat, p.lng]); continue; }
      const d = haversine([prev.lat, prev.lng], [p.lat, p.lng]);
      const dt = Math.max(0.5, (p.t - prev.t) / 1000);
      if (d < Math.max(MIN_MOVE, Math.min(p.acc, 12) * 0.5)) continue;
      if (d / dt > MAX_SPEED) continue;
      this.m += d;
      this.lastBySeg.set(p.seg, p);
      this.route.push([p.lat, p.lng]);
    }
  }
  pull() {
    const pts = db.getAllSync<Pt>("SELECT * FROM walk_points WHERE seq > ? ORDER BY seq", this.lastSeq);
    this.feed(pts);
    return pts.length;
  }
}

export const getActive = () => getSetting<ActiveWalk | null>("activeWalk", null);
export const walkedMs = (w: ActiveWalk, now = Date.now()) => w.accMs + (w.runningSince ? now - w.runningSince : 0);

export async function ensureWalkPermissions(): Promise<string | null> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return "Location permission is needed to track walks.";
  const on = await Location.hasServicesEnabledAsync();
  if (!on) return "Turn on your phone's location (GPS) first.";
  return null;
}

async function startUpdates() {
  const running = await Location.hasStartedLocationUpdatesAsync(WALK_TASK).catch(() => false);
  if (running) return;
  await Location.startLocationUpdatesAsync(WALK_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 2000,
    distanceInterval: 3,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "FitFaaz is tracking your walk",
      notificationBody: "Open the app to pause or stop.",
      notificationColor: "#00A99D",
      killServiceOnDestroy: false,
    },
  });
}
async function stopUpdates() {
  const running = await Location.hasStartedLocationUpdatesAsync(WALK_TASK).catch(() => false);
  if (running) await Location.stopLocationUpdatesAsync(WALK_TASK);
}

export async function startWalk() {
  db.runSync("DELETE FROM walk_points");
  const w: ActiveWalk = {
    status: "walking", date: today(), start: nowHM(), startedAt: Date.now(),
    accMs: 0, runningSince: Date.now(), seg: 1, steps: 0,
  };
  setSetting("activeWalk", w);
  try { await startUpdates(); } catch (e) { setSetting("activeWalk", null); throw e; }
  return w;
}
export async function pauseWalk(stepsNow: number) {
  const w = getActive(); if (!w || w.status !== "walking") return w;
  const next: ActiveWalk = { ...w, status: "paused", accMs: walkedMs(w), runningSince: null, steps: stepsNow };
  setSetting("activeWalk", next);
  await stopUpdates();
  return next;
}
export async function resumeWalk() {
  const w = getActive(); if (!w || w.status !== "paused") return w;
  const next: ActiveWalk = { ...w, status: "walking", runningSince: Date.now(), seg: w.seg + 1 };
  setSetting("activeWalk", next);
  await startUpdates();
  return next;
}
/** Re-attach GPS if the app was restarted in the middle of a walk. */
export async function reattach() {
  const w = getActive();
  if (w?.status === "walking") await startUpdates().catch(() => {});
}

export const strideM = (p: Profile) => (p.height * 0.415) / 100;
export const walkKcal = (m: number, secs: number, kg: number) => {
  if (secs <= 0) return 0;
  const v = (m / secs) * 60; // m/min
  return (((3.5 + 0.1 * v) * kg) / 1000) * 5 * (secs / 60);
};
/** Pedometer steps when they look sane, otherwise an estimate from distance. */
export const bestSteps = (pedo: number, m: number, p: Profile) => {
  const est = m / strideM(p);
  return pedo >= est * 0.6 ? pedo : est;
};

export async function finishWalk(save: boolean, pedoSteps: number, profile: Profile) {
  const w = getActive();
  await stopUpdates();
  if (!w) return null;
  const odo = new Odometer();
  odo.pull();
  const secs = walkedMs(w) / 1000;
  let saved = null;
  if (save && secs > 5) {
    const steps = bestSteps(pedoSteps, odo.m, profile);
    const kcal = walkKcal(odo.m, secs, profile.weight);
    // keep the stored route light
    const step = Math.max(1, Math.ceil(odo.route.length / 600));
    const route = odo.route.filter((_, i) => i % step === 0 || i === odo.route.length - 1)
      .map(([a, b]) => [+a.toFixed(6), +b.toFixed(6)]);
    saved = { id: uid(), date: w.date, start: w.start, secs, m: odo.m, steps, kcal };
    db.runSync(
      "INSERT INTO walks (id, date, start, secs, m, steps, kcal, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      saved.id, saved.date, saved.start, saved.secs, saved.m, saved.steps, saved.kcal, JSON.stringify(route),
    );
  }
  db.runSync("DELETE FROM walk_points");
  setSetting("activeWalk", null);
  return saved;
}

export function walkRoute(id: string): [number, number][] {
  const r = db.getFirstSync<{ route: string }>("SELECT route FROM walks WHERE id = ?", id);
  try { return r?.route ? JSON.parse(r.route) : []; } catch { return []; }
}
