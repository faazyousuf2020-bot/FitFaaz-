import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { db, getSetting, setSetting } from "./lib/db";
import { DEFAULT_REMINDERS } from "./lib/reminders";
import type { CustomFood, Exercise, Food, PlanItem, Profile, Reminders, Session, Walk, Workout } from "./lib/types";
import { addDays, nowHM, today, uid } from "./lib/util";

export const DEFAULT_PROFILE: Profile = { weight: 70, height: 170, age: 30, sex: "male" };

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
  sessionStart: number | null;
};

function load(): Omit<Data, "todayISO"> {
  const customRows = db.getAllSync<CustomFood>("SELECT * FROM custom_foods");
  const saved = getSetting<Profile | null>("profile", null);
  return {
    profile: saved ?? DEFAULT_PROFILE,
    profileSet: !!saved,
    walks: db.getAllSync<Walk>("SELECT id, date, start, secs, m, steps, kcal FROM walks ORDER BY date, start"),
    food: db.getAllSync<Food>("SELECT * FROM food ORDER BY date, time"),
    custom: Object.fromEntries(customRows.map((c) => [c.name, c])),
    workouts: db.getAllSync<Workout>("SELECT * FROM workouts ORDER BY date, time"),
    sessions: db.getAllSync<Session>("SELECT * FROM sessions ORDER BY date"),
    plan: db.getAllSync<PlanItem>("SELECT * FROM plan ORDER BY date, rowid"),
    restDays: new Set(db.getAllSync<{ date: string }>("SELECT date FROM rest_days").map((r) => r.date)),
    reminders: { ...DEFAULT_REMINDERS, ...getSetting<Partial<Reminders>>("reminders", {}) },
    sessionStart: getSetting<number | null>("sessionStart", null),
  };
}

function useStoreValue() {
  const [data, setData] = useState<Data>(() => ({ ...load(), todayISO: today() }));
  const reload = useCallback(() => setData((d) => ({ ...load(), todayISO: today() })), []);

  // keep "today" correct across midnight and when the app comes back
  useEffect(() => {
    const tick = () => setData((d) => (d.todayISO === today() ? d : { ...d, todayISO: today() }));
    const h = setInterval(tick, 30000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && reload());
    return () => { clearInterval(h); sub.remove(); };
  }, [reload]);

  const actions = useMemo(() => ({
    reload,
    saveProfile(p: Profile) { setSetting("profile", p); reload(); },
    saveReminders(r: Reminders) { setSetting("reminders", r); reload(); },

    addFood(entry: string, kcal: number, src: string, meal: string) {
      db.runSync("INSERT INTO food (id, date, time, meal, entry, kcal, src) VALUES (?, ?, ?, ?, ?, ?, ?)",
        uid(), today(), nowHM(), meal, entry, kcal, src);
      reload();
    },
    delFood(id: string) { db.runSync("DELETE FROM food WHERE id = ?", id); reload(); },
    saveCustom(c: CustomFood) {
      db.runSync("INSERT OR REPLACE INTO custom_foods (name, kcal_serving, kcal100, serving_g, src) VALUES (?, ?, ?, ?, ?)",
        c.name, c.kcal_serving, c.kcal100, c.serving_g, c.src);
      reload();
    },
    delCustom(name: string) { db.runSync("DELETE FROM custom_foods WHERE name = ?", name); reload(); },

    addWorkout(e: Exercise) {
      db.runSync("INSERT INTO workouts (id, date, time, name, sets, reps, dur, kg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        uid(), today(), nowHM(), e.name, e.sets, e.reps, e.dur, e.kg);
      reload();
    },
    delWorkout(id: string) { db.runSync("DELETE FROM workouts WHERE id = ?", id); reload(); },
    startSession() { setSetting("sessionStart", Date.now()); reload(); },
    stopSession(): number {
      const start = getSetting<number | null>("sessionStart", null);
      setSetting("sessionStart", null);
      let secs = 0;
      if (start) {
        secs = (Date.now() - start) / 1000;
        if (secs > 10) db.runSync("INSERT INTO sessions (id, date, secs) VALUES (?, ?, ?)", uid(), today(), secs);
      }
      reload();
      return secs;
    },

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
  }), [reload]);

  return { ...data, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx)!;

/** BMR (Mifflin–St Jeor) */
export const bmr = (p: Profile) => {
  const b = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.sex === "male" ? b + 5 : b - 161;
};
