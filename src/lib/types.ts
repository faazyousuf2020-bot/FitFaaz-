export type Sex = "male" | "female";
export type Profile = { weight: number; height: number; age: number; sex: Sex };

export type Walk = { id: string; date: string; start: string; secs: number; m: number; steps: number; kcal: number };
export type Food = { id: string; date: string; time: string; meal: string; entry: string; kcal: number; src: string };
export type CustomFood = {
  name: string;
  kcal_serving: number | null; // calories for one serving/piece, entered by hand
  kcal100: number | null; // calories per 100 g (from Open Food Facts)
  serving_g: number | null; // grams in one serving, if known
  src: string;
};
export type Exercise = { name: string; sets: number; reps: number; dur: number; kg: number };
export type Workout = Exercise & { id: string; date: string; time: string };
export type Session = { id: string; date: string; secs: number };
export type PlanItem = Exercise & { id: string; date: string };

export type Reminder = { on: boolean; time: string };
export type Reminders = { walk: Reminder; food: Reminder; workout: Reminder };

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
