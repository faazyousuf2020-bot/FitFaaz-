// Workout parsing, categories and calorie maths. Run with `npm test`.
import { activeSecs, dayWorkout } from "../src/lib/burn";
import { autoCategory } from "../src/lib/categories";
import type { Category, Session, Workout } from "../src/lib/types";
import { parseWo, planStatus } from "../src/lib/workout";

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = typeof want === "number" ? Math.abs((got as number) - want) < 0.6 : JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`✗ ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`));
};

eq("3x15", parseWo("pushups 3x15", []), { name: "pushups", sets: 3, reps: 15, dur: 0, kg: 0 });
eq("60s", parseWo("plank 60s", []), { name: "plank", sets: 0, reps: 0, dur: 60, kg: 0 });
eq("3x60s", parseWo("plank 3x60s", []), { name: "plank", sets: 3, reps: 0, dur: 60, kg: 0 });
eq("kg", parseWo("curls 3x10 8kg", []), { name: "curls", sets: 3, reps: 10, dur: 0, kg: 8 });
eq("walk", parseWo("walk 30 min", []), { name: "walk", sets: 0, reps: 0, dur: 1800, kg: 0 });
eq("known name", parseWo("push ups 2x10", ["pushups"]).name, "pushups");

for (const [n, c] of [["pushups", "calisthenics"], ["shoulder press", "weights"], ["pistol squats", "calisthenics"], ["side crunches", "calisthenics"],
  ["toe touches", "stretches"], ["wings stretches", "stretches"], ["leg raises", "calisthenics"], ["skipping", "cardio"], ["bicep curls", "weights"]] as const)
  eq(`category ${n}`, autoCategory(n), c);
eq("weighted squat", autoCategory("squats", 20), "weights");
eq("unknown", autoCategory("zorbing"), null);

const cats: Category[] = [
  { id: "calisthenics", name: "Calisthenics", met: 6, builtin: 1, sort: 1 },
  { id: "weights", name: "Weight training", met: 5, builtin: 1, sort: 2 },
  { id: "stretches", name: "Stretches", met: 2.3, builtin: 1, sort: 3 },
  { id: "cardio", name: "Cardio", met: 8, builtin: 1, sort: 4 },
];
const w = (o: Partial<Workout>): Workout => ({ id: Math.random().toString(), date: "2026-10-03", time: "07:00", name: "pushups", sets: 3, reps: 15, dur: 0, kg: 0, active: null, rest: null, session_id: null, ...o });

// untimed: 3 sets of 15 → 45 s each, rest 45 s each
const d1 = dayWorkout("2026-10-03", [w({})], [], cats, {}, 70);
eq("untimed active", d1.active, 135); eq("untimed rest", d1.rest, 135); eq("untimed kcal", d1.kcal, 6 * 70 * 135 / 3600 + 2 * 70 * 135 / 3600);
eq("estimated flag", d1.estimated, true);
// timed session: 20 min, two 60 s sets
const s: Session = { id: "s1", date: "2026-10-03", secs: 1200, active: 120, rest: 1080, start_ts: 0, end_ts: 0 };
const rows = [w({ sets: 1, reps: 10, active: 60, rest: 0, session_id: "s1" }), w({ sets: 1, reps: 10, active: 60, rest: 90, session_id: "s1" })];
const d2 = dayWorkout("2026-10-03", rows, [s], cats, {}, 70);
eq("session secs", d2.secs, 1200); eq("session active", d2.active, 120); eq("session rest", d2.rest, 1080);
eq("session kcal", d2.kcal, 6 * 70 * 120 / 3600 + 2 * 70 * 1080 / 3600); eq("session not estimated", d2.estimated, false);
eq("timed hold active", activeSecs(w({ name: "plank", sets: 3, reps: 0, dur: 60 })), 180);

// plan status with timed holds
const plan = { id: "p", date: "2026-10-03", name: "plank", sets: 3, reps: 0, dur: 60, kg: 0 };
eq("plank partly", planStatus("2026-10-03", plan, "2026-10-03", [], [w({ name: "plank", sets: 1, reps: 0, dur: 60 })], 0), "part");
eq("plank done", planStatus("2026-10-03", plan, "2026-10-03", [], [w({ name: "plank", sets: 3, reps: 0, dur: 60 })], 0), "done");
eq("pushups done by sets", planStatus("2026-10-03", { ...plan, name: "pushups", reps: 8, dur: 0 }, "2026-10-03", [],
  [1, 2, 3].map(() => w({ sets: 1, reps: 8, active: 30, session_id: "x" })), 0), "done");

console.log(`\nworkout checks: ${pass} passed · ${fail} failed`);
if (fail) process.exit(1);
