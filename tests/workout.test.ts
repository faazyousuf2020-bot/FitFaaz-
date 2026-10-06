// Workout parsing, categories and calorie maths. Run with `npm test`.
import { activeSecs, dayWorkout, sessionTotals } from "../src/lib/burn";
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

// untimed: 3 sets of 15 → 45 s each, about 1 minute of rest between sets (2 gaps)
const d1 = dayWorkout("2026-10-03", [w({})], [], cats, {}, 70);
eq("untimed active", d1.active, 135); eq("untimed rest", d1.rest, 120);
eq("untimed kcal (net MET)", d1.kcal, (6 - 1) * 70 * 135 / 3600 + (2 - 1) * 70 * 120 / 3600);
eq("estimated flag", d1.estimated, true);
// timed session: 3 sets of pushups, 40 s each, 60 s rest between; first set has no rest before it
const s: Session = { id: "s1", date: "2026-10-03", secs: 1500, active: 120, rest: 120, start_ts: 0, end_ts: 0 };
const rows = [
  w({ sets: 1, reps: 10, active: 40, rest: 0, session_id: "s1" }),
  w({ sets: 1, reps: 10, active: 40, rest: 60, session_id: "s1" }),
  w({ sets: 1, reps: 10, active: 40, rest: 60, session_id: "s1" }),
];
const d2 = dayWorkout("2026-10-03", rows, [s], cats, {}, 80);
eq("session active", d2.active, 120); eq("session rest (only between sets)", d2.rest, 120); eq("session time", d2.secs, 240);
eq("session kcal", d2.kcal, 5 * 80 * 120 / 3600 + 1 * 80 * 120 / 3600); eq("session not estimated", d2.estimated, false);
// a 20-minute break counts as 5 minutes of rest
const d3 = dayWorkout("2026-10-03", [rows[0], w({ sets: 1, reps: 10, active: 40, rest: 1200, session_id: "s1" })], [s], cats, {}, 80);
eq("long break capped", d3.rest, 300);
// a session left running with nothing happening adds nothing
const idle = { id: "s9", startedAt: new Date("2026-10-03T07:00:00").getTime(), current: "pushups", setStartedAt: null, lastSetEndedAt: null };
eq("idle live session adds nothing", dayWorkout("2026-10-03", [], [], cats, {}, 80, idle, new Date("2026-10-03T08:00:00").getTime()).kcal, 0);
// a set in progress counts as exercise
const running = { ...idle, setStartedAt: new Date("2026-10-03T07:59:30").getTime() };
eq("set in progress", dayWorkout("2026-10-03", [], [], cats, {}, 80, running, new Date("2026-10-03T08:00:00").getTime()).active, 30);
// resting right now counts as rest, up to 5 minutes
const resting = { ...idle, lastSetEndedAt: new Date("2026-10-03T07:50:00").getTime() };
eq("rest in progress capped", dayWorkout("2026-10-03", [], [], cats, {}, 80, resting, new Date("2026-10-03T08:00:00").getTime()).rest, 300);
eq("timed hold active", activeSecs(w({ name: "plank", sets: 3, reps: 0, dur: 60 })), 180);
eq("session totals", JSON.stringify(sessionTotals(rows, cats, {}, 80)), JSON.stringify({ active: 120, rest: 120, secs: 240, kcal: 5 * 80 * 120 / 3600 + 80 * 120 / 3600 }));

// plan status with timed holds
const plan = { id: "p", date: "2026-10-03", name: "plank", sets: 3, reps: 0, dur: 60, kg: 0 };
eq("plank partly", planStatus("2026-10-03", plan, "2026-10-03", [], [w({ name: "plank", sets: 1, reps: 0, dur: 60 })], 0), "part");
eq("plank done", planStatus("2026-10-03", plan, "2026-10-03", [], [w({ name: "plank", sets: 3, reps: 0, dur: 60 })], 0), "done");
eq("pushups done by sets", planStatus("2026-10-03", { ...plan, name: "pushups", reps: 8, dur: 0 }, "2026-10-03", [],
  [1, 2, 3].map(() => w({ sets: 1, reps: 8, active: 30, session_id: "x" })), 0), "done");

console.log(`\nworkout checks: ${pass} passed · ${fail} failed`);
if (fail) process.exit(1);
