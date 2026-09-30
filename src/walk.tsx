import { Pedometer } from "expo-sensors";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { getSetting, setSetting } from "./lib/db";
import type { ActiveWalk } from "./lib/types";
import {
  Odometer, bestSteps, ensureWalkPermissions, finishWalk, getActive, pauseWalk, reattach, resumeWalk, startWalk, walkKcal, walkedMs,
} from "./lib/walkTracker";
import { useStore } from "./store";

type Live = {
  active: ActiveWalk | null;
  secs: number;
  m: number;
  steps: number;
  kcal: number;
  route: [number, number][];
  acc: number | null;
  usingSensor: boolean;
};
const EMPTY: Live = { active: null, secs: 0, m: 0, steps: 0, kcal: 0, route: [], acc: null, usingSensor: false };

function useWalkValue() {
  const store = useStore();
  const profileRef = useRef(store.profile);
  profileRef.current = store.profile;
  const [live, setLive] = useState<Live>(EMPTY);
  const odo = useRef(new Odometer());
  const pedo = useRef({ carried: 0, runStart: null as number | null, runLast: null as number | null, ok: false });
  const sub = useRef<{ remove: () => void } | null>(null);

  const pedoSteps = () => {
    const p = pedo.current;
    return p.carried + (p.runStart != null && p.runLast != null ? p.runLast - p.runStart : 0);
  };

  const compute = useCallback(() => {
    const active = getActive();
    if (!active) { setLive(EMPTY); return; }
    odo.current.pull();
    const secs = walkedMs(active) / 1000;
    const m = odo.current.m;
    const p = profileRef.current;
    setLive({
      active, secs, m,
      steps: bestSteps(pedoSteps(), m, p),
      kcal: walkKcal(m, secs, p.weight),
      route: odo.current.route.slice(),
      acc: odo.current.lastAcc,
      usingSensor: pedo.current.ok,
    });
  }, []);

  const unsubscribe = () => { sub.current?.remove(); sub.current = null; };
  const subscribe = useCallback(async () => {
    unsubscribe();
    try {
      if (!(await Pedometer.isAvailableAsync())) return;
      const perm = await Pedometer.requestPermissionsAsync();
      if (!perm.granted) return;
      pedo.current.runStart = null;
      pedo.current.runLast = null;
      let lastSave = 0;
      sub.current = Pedometer.watchStepCount(({ steps }) => {
        const p = pedo.current;
        if (p.runStart == null) p.runStart = steps;
        p.runLast = steps;
        p.ok = true;
        if (Date.now() - lastSave > 10000) { lastSave = Date.now(); setSetting("walkStepsLive", pedoSteps()); }
      });
    } catch { /* no sensor — distance estimate is used */ }
  }, []);

  // restore a walk in progress after the app restarts
  useEffect(() => {
    const a = getActive();
    if (a) {
      pedo.current.carried = Math.max(a.steps, getSetting<number>("walkStepsLive", 0));
      if (a.status === "walking") { reattach(); subscribe(); }
    }
    compute();
    const s = AppState.addEventListener("change", (st) => st === "active" && compute());
    return () => { s.remove(); unsubscribe(); };
  }, [compute, subscribe]);

  useEffect(() => {
    if (!live.active) return;
    const h = setInterval(compute, 1000);
    return () => clearInterval(h);
  }, [live.active?.status, compute]);

  const start = useCallback(async () => {
    const err = await ensureWalkPermissions();
    if (err) throw new Error(err);
    odo.current = new Odometer();
    pedo.current = { carried: 0, runStart: null, runLast: null, ok: false };
    setSetting("walkStepsLive", 0);
    await startWalk();
    await subscribe();
    compute();
  }, [compute, subscribe]);

  const pause = useCallback(async () => {
    const total = pedoSteps();
    unsubscribe();
    pedo.current = { ...pedo.current, carried: total, runStart: null, runLast: null };
    await pauseWalk(total);
    compute();
  }, [compute]);

  const resume = useCallback(async () => {
    const err = await ensureWalkPermissions();
    if (err) throw new Error(err);
    await resumeWalk();
    await subscribe();
    compute();
  }, [compute, subscribe]);

  const stop = useCallback(async (save: boolean) => {
    const total = pedoSteps();
    unsubscribe();
    const saved = await finishWalk(save, total, profileRef.current);
    setSetting("walkStepsLive", null);
    odo.current = new Odometer();
    pedo.current = { carried: 0, runStart: null, runLast: null, ok: false };
    compute();
    store.reload();
    return saved;
  }, [compute, store.reload]);

  return { ...live, start, pause, resume, stop };
}

type WalkCtx = ReturnType<typeof useWalkValue>;
const Ctx = createContext<WalkCtx | null>(null);
export function WalkProvider({ children }: { children: React.ReactNode }) {
  const v = useWalkValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useWalk = () => useContext(Ctx)!;
