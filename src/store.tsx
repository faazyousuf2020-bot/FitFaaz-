import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { activeSecs, restSecs } from "./lib/burn";
import { exKey } from "./lib/categories";
import { db, getSetting, setSetting } from "./lib/db";
import { calcItem, estimateMacros, Item } from "./lib/foodEngine";
import { DEFAULT_REMINDERS } from "./lib/reminders";
import type {
  Category, CustomFood, Exercise, ExerciseMeta, Food, LiveSession, MacroTargets, PlanItem, Profile, Reminders, RestAlert,
  Session, Walk, Workout,
} from "./lib/types";
import { addDays, nowHM, today, uid } from "./lib/util";

export const DEFAULT_PROFILE: Profile = { weight: 70, height: 170, age: 30, sex: "male" };
export const DEFAULT_REST: RestAlert = { on: false, secs: 90 };

/** BMR (Mifflin–St Jeor) */
export const bmr = (p: Profile) => {
  const b = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.sex === "male" ? b + 5 : b - 161;
};
/** Suggested macro targets: ~1.6 g protein per kg, 25% of calories from fat, the rest carbs. */
export function autoTargets(p: Profile): MacroTargets {
  const kcal = bmr(p) * 1.2;
  const prot = Math.round(p.weight * 1.6);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { auto: true, p: prot, c: carbs, f: fat };
}

/** Older food entries were saved without macros: fill them in once. */
function backfillMacros(custom: Record<string, CustomFood>) {
  const rows = db.getAllSync<Food>("SELECT * FROM food WHERE p IS NULL");
  if (!rows.length) return;
  db.withTransactionSync(() => {
    for (const r of rows) {
      const it = calcItem(r.entry, custom);
      let m, est = 0;
      if (it.how !== "unknown" && it.kcal > 0) {
        const k = r.kcal / it.kcal;
        m = { p: it.p * k, c: it.c * k, f: it.f * k, fib: it.fib * k };
        est = it.est ? 1 : 0;
      } else { m = estimateMacros(r.kcal, r.entry); est = 1; }
      db.runSync("UPDATE food SET p = ?, c = ?, f = ?, fib = ?, est = ?, grams = COALESCE(grams, ?) WHERE id = ?",
        m.p, m.c, m.f, m.fib, est, it.how !== "unknown" ? it.grams : null, r.id);
    }
  });
}

type Data = {
  todayISO: string;
  profile: Profile;
  profileSet: boolean;
  walks: Walk[];
  food: Food[];
  custom: Record<string, CustomFood>;
  workouts: Workout[];
  sessions: Session[];
  plan: PlanItem[];
  restDays: Set<string>;
  reminders: Reminders;
  categories: Category[];
  meta: Record<string, ExerciseMeta>;
  targets: MacroTargets;
  restAlert: RestAlert;
  live: LiveSession | null;
};

function load(): Omit<Data, "todayISO"> {
  const customRows = db.getAllSync<CustomFood>("SELECT * FROM custom_foods");
  const custom = Object.fromEntries(customRows.map((c) => [c.name, c]));
  backfillMacros(custom);
  const saved = getSetting<Profile | null>("profile", null);
  const profile = saved ?? DEFAULT_PROFILE;
  const t = getSetting<MacroTargets | null>("macroTargets", null);
  // older versions kept only a start time for the workout timer
  const oldStart = getSetting<number | null>("sessionStart", null);
  if (oldStart) {
    setSetting("liveSession", { id: uid(), startedAt: oldStart, current: null, setStartedAt: null, lastSetEndedAt: null });
    setSetting("sessionStart", null);
  }
  return {
    profile,
    profileSet: !!saved,
    walks: db.getAllSync<Walk>("SELECT id, date, start, secs, m, steps, kcal FROM walks ORDER BY date, start"),
    food: db.getAllSync<Food>("SELECT * FROM food ORDER BY date, time, rowid"),
    custom,
    workouts: db.getAllSync<Workout>("SELECT * FROM workouts ORDER BY date, time, rowid"),
    sessions: db.getAllSync<Session>("SELECT * FROM sessions ORDER BY date"),
    plan: db.getAllSync<PlanItem>("SELECT * FROM plan ORDER BY date, rowid"),
    restDays: new Set(db.getAllSync<{ date: string }>("SELECT date FROM rest_days").map((r) => r.date)),
    reminders: { ...DEFAULT_REMINDERS, ...getSetting<Partial<Reminders>>("reminders", {}) },
    categories: db.getAllSync<Category>("SELECT * FROM categories ORDER BY sort, name"),
    meta: Object.fromEntries(db.getAllSync<ExerciseMeta>("SELECT * FROM exercise_meta").map((m) => [m.key, m])),
    targets: !t || t.auto ? autoTargets(profile) : t,
    restAlert: { ...DEFAULT_REST, ...getSetting<Partial<RestAlert>>("restAlert", {}) },
    live: getSetting<LiveSession | null>("liveSession", null),
  };
}

export type FoodValues = Pick<Item, "kcal" | "p" | "c" | "f" | "fib" | "grams" | "src" | "est">;

function useStoreValue() {
  const [data, setData] = useState<Data>(() => ({ ...load(), todayISO: today() }));
  const reload = useCallback(() => setData(() => ({ ...load(), todayISO: today() })), []);

  // keep "today" correct across midnight and when the app comes back
  useEffect(() => {
    const tick = () => setData((d) => (d.todayISO === today() ? d : { ...d, todayISO: today() }));
    const h = setInterval(tick, 30000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && reload());
    return () => { clearInterval(h); sub.remove(); };
  }, [reload]);

  const actions = useMemo(() => {
    const insertWorkout = (e: Exercise, extra: Partial<Workout> = {}) =>
      db.runSync(
        "INSERT INTO workouts (id, date, time, name, sets, reps, dur, kg, active, rest, session_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        uid(), today(), nowHM(), e.name, e.sets, e.reps, e.dur, e.kg, extra.active ?? null, extra.rest ?? null, extra.session_id ?? null,
      );
    return {
      reload,
      saveProfile(p: Profile) { setSetting("profile", p); reload(); },
      saveReminders(r: Reminders) { setSetting("reminders", r); reload(); },
      saveTargets(t: MacroTargets) { setSetting("macroTargets", t); reload(); },
      saveRestAlert(r: RestAlert) { setSetting("restAlert", r); reload(); },

      /* ---------- food ---------- */
      addFood(entry: string, v: FoodValues, meal: string) {
        db.runSync(
          "INSERT INTO food (id, date, time, meal, entry, kcal, src, grams, p, c, f, fib, est) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          uid(), today(), nowHM(), meal, entry, v.kcal, v.src, v.grams, v.p, v.c, v.f, v.fib, v.est ? 1 : 0,
        );
        reload();
      },
      updateFood(id: string, v: Partial<Food>) {
        const cols = Object.keys(v) as (keyof Food)[];
        if (!cols.length) return;
        db.runSync(`UPDATE food SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, ...cols.map((c) => v[c] as any), id);
        reload();
      },
      delFood(id: string) { db.runSync("DELETE FROM food WHERE id = ?", id); reload(); },
      saveCustom(c: CustomFood) {
        db.runSync(
          "INSERT OR REPLACE INTO custom_foods (name, kcal_serving, kcal100, serving_g, src, p, c, f, fib, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          c.name, c.kcal_serving, c.kcal100, c.serving_g, c.src, c.p, c.c, c.f, c.fib, c.barcode,
        );
        reload();
      },
      delCustom(name: string) { db.runSync("DELETE FROM custom_foods WHERE name = ?", name); reload(); },
      customByBarcode(code: string): CustomFood | null {
        return db.getFirstSync<CustomFood>("SELECT * FROM custom_foods WHERE barcode = ?", code) ?? null;
      },

      /* ---------- workouts ---------- */
      addWorkout(e: Exercise) {
        const live = getSetting<LiveSession | null>("liveSession", null);
        insertWorkout(e, { session_id: live?.id ?? null });
        reload();
      },
      updateWorkout(id: string, v: Partial<Workout>) {
        const cols = Object.keys(v) as (keyof Workout)[];
        if (!cols.length) return;
        db.runSync(`UPDATE workouts SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, ...cols.map((c) => v[c] as any), id);
        reload();
      },
      delWorkout(id: string) { db.runSync("DELETE FROM workouts WHERE id = ?", id); reload(); },

      /* ---------- live session ---------- */
      /** Start timing a workout; optionally with an exercise already picked. */
      startSession(current: string | null = null) {
        const s: LiveSession = { id: uid(), startedAt: Date.now(), current, setStartedAt: null, lastSetEndedAt: null };
        setSetting("liveSession", s); reload();
      },
      setLive(patch: Partial<LiveSession>) {
        const s = getSetting<LiveSession | null>("liveSession", null);
        if (!s) return;
        setSetting("liveSession", { ...s, ...patch }); reload();
      },
      /** Finish a timed set and save it. */
      endSet(e: Exercise) {
        const s = getSetting<LiveSession | null>("liveSession", null);
        if (!s || !s.setStartedAt) return;
        const end = Date.now();
        const active = (end - s.setStartedAt) / 1000;
        const rest = s.lastSetEndedAt ? (s.setStartedAt - s.lastSetEndedAt) / 1000 : 0;
        insertWorkout({ ...e, sets: e.reps ? 1 : 0, dur: e.reps ? 0 : Math.round(active) }, { active, rest, session_id: s.id });
        setSetting("liveSession", { ...s, setStartedAt: null, lastSetEndedAt: end });
        reload();
      },
      /** Stop the session. Returns its summary numbers. */
      stopSession() {
        const s = getSetting<LiveSession | null>("liveSession", null);
        setSetting("liveSession", null);
        if (!s) { reload(); return null; }
        const end = Date.now();
        const secs = (end - s.startedAt) / 1000;
        const rows = db.getAllSync<Workout>("SELECT * FROM workouts WHERE session_id = ?", s.id);
        if (secs < 10 && !rows.length) { reload(); return null; }
        const active = rows.reduce((a, w) => a + activeSecs(w), 0);
        const restTotal = rows.reduce((a, w) => a + restSecs(w), 0);
        const date = new Date(s.startedAt);
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        db.runSync("INSERT INTO sessions (id, date, secs, active, rest, start_ts, end_ts) VALUES (?, ?, ?, ?, ?, ?, ?)",
          s.id, iso, secs, active, restTotal, s.startedAt, end);
        reload();
        return { id: s.id, secs, rows };
      },

      /* ---------- categories ---------- */
      addCategory(name: string, met: number) {
        const id = "c_" + uid();
        db.runSync("INSERT INTO categories (id, name, met, builtin, sort) VALUES (?, ?, ?, 0, 100)", id, name.trim(), met);
        reload();
        return id;
      },
      updateCategory(id: string, name: string, met: number) {
        db.runSync("UPDATE categories SET name = ?, met = ? WHERE id = ?", name.trim(), met, id); reload();
      },
      deleteCategory(id: string) {
        db.runSync("DELETE FROM categories WHERE id = ? AND builtin = 0", id);
        db.runSync("UPDATE exercise_meta SET cat = NULL WHERE cat = ?", id);
        reload();
      },
      setExerciseCat(name: string, cat: string | null) {
        db.runSync(
          "INSERT INTO exercise_meta (key, name, cat) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET cat = excluded.cat, name = excluded.name",
          exKey(name), name, cat,
        );
        reload();
      },
      setExerciseRest(name: string, secs: number | null) {
        db.runSync(
          "INSERT INTO exercise_meta (key, name, rest_secs) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET rest_secs = excluded.rest_secs",
          exKey(name), name, secs,
        );
        reload();
      },

      /* ---------- plan ---------- */
      addPlan(date: string, e: Exercise) {
        db.runSync("INSERT INTO plan (id, date, name, sets, reps, dur, kg) VALUES (?, ?, ?, ?, ?, ?, ?)",
          uid(), date, e.name, e.sets, e.reps, e.dur, e.kg);
        db.runSync("DELETE FROM rest_days WHERE date = ?", date);
        reload();
      },
      delPlan(id: string) { db.runSync("DELETE FROM plan WHERE id = ?", id); reload(); },
      toggleRest(date: string) {
        const has = db.getFirstSync("SELECT date FROM rest_days WHERE date = ?", date);
        if (has) db.runSync("DELETE FROM rest_days WHERE date = ?", date);
        else db.runSync("INSERT INTO rest_days (date) VALUES (?)", date);
        reload();
      },
      copyWeek(ws: string) {
        db.withTransactionSync(() => {
          for (let i = 0; i < 7; i++) {
            const from = addDays(ws, i), to = addDays(ws, i + 7);
            db.runSync("DELETE FROM plan WHERE date = ?", to);
            const items = db.getAllSync<PlanItem>("SELECT * FROM plan WHERE date = ? ORDER BY rowid", from);
            for (const p of items)
              db.runSync("INSERT INTO plan (id, date, name, sets, reps, dur, kg) VALUES (?, ?, ?, ?, ?, ?, ?)",
                uid(), to, p.name, p.sets, p.reps, p.dur, p.kg);
            const rest = db.getFirstSync("SELECT date FROM rest_days WHERE date = ?", from);
            db.runSync("DELETE FROM rest_days WHERE date = ?", to);
            if (rest) db.runSync("INSERT INTO rest_days (date) VALUES (?)", to);
          }
        });
        reload();
      },
      delWalk(id: string) { db.runSync("DELETE FROM walks WHERE id = ?", id); reload(); },
    };
  }, [reload]);

  return { ...data, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx)!;
