import type { Category, ExerciseMeta } from "./types";

export const exKey = (n: string) => n.toLowerCase().replace(/[\s\-_]/g, "").replace(/(es|s)$/, "");

// Checked in this order; first match wins. Phrases before single words.
const RULES: [string, string[]][] = [
  ["stretches", ["toe touch", "stretch", "yoga", "wing", "cobra", "child pose", "childs pose", "butterfly", "neck roll", "neck rotation",
    "arm circle", "shoulder roll", "cat cow", "downward dog", "surya namaskar", "sun salutation", "pranayama", "meditation", "foam roll",
    "mobility", "warm up", "warmup", "cool down", "cooldown", "hip opener", "pigeon", "lunge stretch", "trikonasana", "bhujangasana",
    "vajrasana", "padmasana", "tadasana", "asana", "breathing", "spinal twist", "side bend"]],
  ["cardio", ["jumping jack", "jump rope", "skipping", "skip", "high knee", "running", "run", "jog", "sprint", "cycling", "cycle", "bike",
    "spin", "swim", "rowing machine", "rowing", "treadmill", "elliptical", "stair", "step up", "dance", "zumba", "aerobic", "hiit",
    "tabata", "walk", "badminton", "football", "cricket", "tennis", "basketball", "volleyball", "boxing", "kickboxing", "shadow box", "hike", "trek"]],
  ["weights", ["dumbbell", "barbell", "kettlebell", "curl", "bench", "deadlift", "shoulder press", "overhead press", "military press",
    "chest press", "leg press", "row", "pulldown", "pull down", "fly", "flye", "shrug", "tricep extension", "triceps extension", "skull",
    "leg extension", "leg curl", "cable", "machine", "preacher", "hammer", "clean", "snatch", "thruster", "lateral raise", "front raise",
    "rdl", "hip thrust", "smith", "weighted", "press"]],
  ["calisthenics", ["push", "pull up", "pullup", "pull-up", "chin", "dip", "squat", "lunge", "crunch", "situp", "sit up", "sit-up", "plank",
    "burpee", "leg raise", "mountain climber", "bridge", "superman", "flutter", "bicycle", "v up", "vup", "hollow", "l sit", "muscle up",
    "handstand", "pike", "wall sit", "calf raise", "russian twist", "jumping squat", "jump squat", "bear crawl", "inchworm", "knee raise",
    "hanging", "dead hang", "abs", "core", "glute", "donkey kick", "fire hydrant", "scissor", "heel touch", "reverse crunch", "side plank"]],
];

/** Category for an exercise: your choice first, then weight logged → weights, then keywords. Null = ask. */
export function autoCategory(name: string, kg = 0): string | null {
  const n = " " + name.toLowerCase().replace(/[-_]/g, " ") + " ";
  for (const [cat, words] of RULES) {
    if (cat === "weights" && kg > 0) return "weights";
    if (words.some((w) => n.includes(w.length <= 4 ? ` ${w}` : w))) {
      // "press" alone is weights unless it's a push-up press etc.
      return cat;
    }
  }
  return kg > 0 ? "weights" : null;
}

export function categoryOf(name: string, meta: Record<string, ExerciseMeta>, kg = 0): string | null {
  const m = meta[exKey(name)];
  if (m?.cat) return m.cat;
  return autoCategory(name, kg);
}

export const metOf = (catId: string | null, cats: Category[]) => cats.find((c) => c.id === catId)?.met ?? 5;

export const INTENSITY: [string, number][] = [["Light", 3], ["Moderate", 5], ["Hard", 7]];
