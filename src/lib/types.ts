export type Sex = "male" | "female";
export type Profile = { weight: number; height: number; age: number; sex: Sex };

export type Walk = { id: string; date: string; start: string; secs: number; m: number; steps: number; kcal: number };
export type Macros = { p: number; c: number; f: number; fib: number };
export type Food = {
  id: string; date: string; time: string; meal: string; entry: string; kcal: number; src: string;
  grams: number | null; p: number | null; c: number | null; f: number | null; fib: number | null; est: number | null;
};
export type CustomFood = {
  name: string;
  kcal_serving: number | null; // calories for one serving/piece (macros below are per serving)
  kcal100: number | null; // calories per 100 g (macros below are per 100 g)
  serving_g: number | null; // grams in one serving, if known
  src: string;
  p: number | null; c: number | null; f: number | null; fib: number | null;
  barcode: string | null;
};
export type Exercise = { name: string; sets: number; reps: number; dur: number; kg: number };
export type Workout = Exercise & {
  id: string; date: string; time: string;
  active: number | null; // timed exercise seconds (live session), null = not timed
  rest: number | null; // rest before this set (live session)
  session_id: string | null;
};
export type Session = { id: string; date: string; secs: number; active: number | null; rest: number | null; start_ts: number | null; end_ts: number | null };
export type PlanItem = Exercise & { id: string; date: string };
export type Category = { id: string; name: string; met: number; builtin: number; sort: number };
export type ExerciseMeta = { key: string; name: string; cat: string | null; rest_secs: number | null };

export type Reminder = { on: boolean; time: string };
export type Reminders = { walk: Reminder; food: Reminder; workout: Reminder };
export type MacroTargets = { auto: boolean; p: number; c: number; f: number };
export type RestAlert = { on: boolean; secs: number };

export type LiveSession = {
  id: string;
  startedAt: number;
  current: string | null; // exercise being done
  setStartedAt: number | null; // a set is running
  lastSetEndedAt: number | null; // rest is running since
};

export type ActiveWalk = {
  status: "walking" | "paused";
  date: string;
  start: string; // HH:MM
  startedAt: number;
  accMs: number; // time walked before the current running stretch
  runningSince: number | null;
  seg: number;
  steps: number; // pedometer steps counted in finished stretches
};
