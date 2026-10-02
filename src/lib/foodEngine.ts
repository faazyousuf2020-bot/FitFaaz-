// Food text → grams, calories and macros. Pure logic (no React Native), so it can be unit-tested.
import { FoodRow, parseFoodTable } from "./foodData";
import type { CustomFood, Macros } from "./types";

export const FOODS = parseFoodTable();

/* ---------- normalising ---------- */
const FRACTIONS: Record<string, string> = { "½": " 1/2", "¼": " 1/4", "¾": " 3/4", "⅓": " 1/3", "⅔": " 2/3" };
export const norm = (s: string) =>
  s.toLowerCase()
    .replace(/[½¼¾⅓⅔]/g, (m) => FRACTIONS[m])
    .replace(/[“”"'`’()[\]!?·|]/g, " ")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/\s*[-–]\s*(?=[a-z])/g, " ") // "parle-g" → "parle g"
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.]$/, "");

const singulars = (k: string): string[] => {
  const out = [k];
  if (k.endsWith("ies")) out.push(k.slice(0, -3) + "y");
  if (k.endsWith("es")) out.push(k.slice(0, -2));
  if (k.endsWith("s")) out.push(k.slice(0, -1));
  return out;
};

/* ---------- index ---------- */
const INDEX = new Map<string, FoodRow>();
for (const r of FOODS) for (const k of [r.name, ...r.aliases]) if (!INDEX.has(norm(k))) INDEX.set(norm(k), r);
const KEYS = [...INDEX.keys()];
export const findFood = (name: string) => INDEX.get(norm(name)) ?? null;

/* ---------- units ---------- */
type UnitInfo = { key: string; grams: number | null }; // grams = fixed weight (g/ml/kg…); null = depends on the food
const UNIT_WORDS: Record<string, UnitInfo> = {};
const unit = (words: string, key: string, grams: number | null = null) =>
  words.split(",").forEach((w) => (UNIT_WORDS[w] = { key, grams }));
unit("g,gm,gms,gram,grams,gr,grm,grms", "g", 1);
unit("kg,kgs,kilo,kilogram,kilograms", "g", 1000);
unit("mg", "g", 0.001);
unit("ml,mls,millilitre,milliliter,millilitres,milliliters", "g", 1);
unit("l,ltr,litre,liter,litres,liters", "g", 1000);
unit("oz,ounce,ounces", "g", 28.35);
unit("pc,pcs,piece,pieces,no,nos,number,numbers,each", "pc");
unit("cup,cups", "cup");
unit("katori,katoris,bowl,bowls,kinnam,vati,small bowl", "katori");
unit("ladle,ladles,karandi,karandis", "ladle");
unit("plate,plates,thali", "plate");
unit("slice,slices", "slice");
unit("tbsp,tbs,tablespoon,tablespoons,spoon,spoons,table spoon,tbl", "tbsp");
unit("tsp,teaspoon,teaspoons,tea spoon", "tsp");
unit("glass,glasses", "glass");
unit("scoop,scoops", "scoop");
unit("handful,handfuls,fistful,fist", "handful");
unit("packet,packets,pack,packs,pkt,pkts,sachet,sachets", "packet");
unit("ball,balls,urundai", "ball");
unit("can,cans,tin,tins", "can");
unit("bottle,bottles", "bottle");
unit("peg,pegs,shot,shots", "peg");
unit("cube,cubes", "cube");
unit("bar,bars", "bar");
unit("tumbler,tumblers", "tumbler");
unit("pint,pints", "pint");
unit("serving,servings,portion,portions,helping,helpings", "serving");
const FALLBACK_G: Record<string, number> = {
  cup: 200, katori: 150, ladle: 60, plate: 300, slice: 30, tbsp: 15, tsp: 5, glass: 250, scoop: 30, handful: 30,
  packet: 50, ball: 150, can: 330, bottle: 500, peg: 30, cube: 20, bar: 40, tumbler: 150, pint: 470,
};
export const UNIT_LABEL: Record<string, string> = {
  pc: "pc", cup: "cup", katori: "katori", ladle: "ladle", plate: "plate", slice: "slice", tbsp: "tbsp", tsp: "tsp",
  glass: "glass", scoop: "scoop", handful: "handful", packet: "packet", ball: "ball", can: "can", bottle: "bottle",
  peg: "peg", cube: "cube", bar: "bar", tumbler: "tumbler", pint: "pint", serving: "serving", g: "g",
};

const NUM_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, quarter: 0.25, dozen: 12, couple: 2,
};
const SIZE_WORDS: Record<string, number> = {
  small: 0.7, chinna: 0.7, little: 0.7, mini: 0.7, medium: 1, regular: 1, normal: 1, large: 1.4, big: 1.4, periya: 1.4,
  "extra large": 1.7, jumbo: 1.7, full: 1, double: 2,
};
export const SIZES: [string, number][] = [["Small", 0.7], ["Regular", 1], ["Large", 1.4]];

/* ---------- parsing a single item ---------- */
export type ParsedItem = { q: number; unit: string | null; unitGrams: number | null; size: number; food: string; raw: string };

const NUM_RE = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+(?:\s*(?:-|to)\s*\d*\.?\d+)?)/;
const toNum = (s: string) => {
  s = s.trim();
  const range = s.match(/^(\d*\.?\d+)\s*(?:-|to)\s*(\d*\.?\d+)$/);
  if (range) return (+range[1] + +range[2]) / 2;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return +frac[1] / +frac[2];
  return +s;
};

function takeUnit(words: string[]): [UnitInfo | null, string | null, string[]] {
  // two-word units first ("table spoon", "small bowl")
  if (words.length > 1 && UNIT_WORDS[words[0] + " " + words[1]]) {
    const w = words[0] + " " + words[1];
    return [UNIT_WORDS[w], w, words.slice(2)];
  }
  if (words.length && UNIT_WORDS[words[0]]) return [UNIT_WORDS[words[0]], words[0], words.slice(1)];
  return [null, null, words];
}

export function parseItem(rawText: string, custom: Record<string, CustomFood> = {}): ParsedItem {
  const raw = rawText.trim();
  let t = norm(raw);
  let q: number | null = null, u: UnitInfo | null = null, size = 1;
  // the whole text is a food name ("half boil", "chicken 65", "5 star")
  if (lookup(t) || singulars(t).some((k) => custom[k])) return { q: 1, unit: null, unitGrams: null, size: 1, food: t, raw };

  // "x2" / "×2" anywhere
  const xm = t.match(/(?:^|\s)[x×*]\s*(\d*\.?\d+)(?:\s|$)/);
  if (xm) { q = +xm[1]; t = t.replace(xm[0], " ").trim(); }

  // leading quantity, possibly glued to a unit ("150g biryani", "2cups tea")
  let m = t.match(NUM_RE);
  if (m && q === null) {
    q = toNum(m[1]);
    t = t.slice(m[0].length).trim();
  } else if (q === null) {
    const w = t.split(" ")[0];
    if (NUM_WORDS[w] !== undefined && t.split(" ").length > 1) { q = NUM_WORDS[w]; t = t.slice(w.length).trim(); }
  }
  let words = t.split(" ").filter(Boolean);
  let unitWord: string | null;
  [u, unitWord, words] = takeUnit(words);
  if (words[0] === "of") words.shift();

  // trailing quantity: "biryani 200g", "chapati 4", "milk 1 cup", "egg 3 nos"
  if (q === null && words.length > 1) {
    const joined = words.join(" ");
    if (!lookup(joined) && !custom[joined]) {
      const tm = joined.match(/^(.+?)\s+(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+(?:\s*-\s*\d*\.?\d+)?)\s*([a-z]+(?: [a-z]+)?)?$/);
      if (tm) {
        const [ui] = tm[3] ? takeUnit(tm[3].split(" ")) : [null];
        if (!tm[3] || ui) {
          q = toNum(tm[2]);
          u = ui;
          unitWord = tm[3] ?? null;
          words = tm[1].split(" ");
        }
      }
    }
  }
  // glued trailing unit: "dal 300g", "milk 100ml", "banana 30gm"
  if (q === null && words.length > 1) {
    const last = words[words.length - 1];
    const gm = last.match(/^(\d*\.?\d+)([a-z]+)$/);
    if (gm && UNIT_WORDS[gm[2]]) { q = +gm[1]; u = UNIT_WORDS[gm[2]]; unitWord = gm[2]; words = words.slice(0, -1); }
  }
  // size words ("small", "large") unless they're part of a food name ("small banana")
  let food = words.join(" ");
  if (!lookup(food) && !custom[food]) {
    for (const [sw, mult] of Object.entries(SIZE_WORDS)) {
      if (food.startsWith(sw + " ")) {
        const rest = food.slice(sw.length + 1);
        food = rest; size = mult;
        // allow "half plate", "large cup"
        const [u2, uw2, w2] = takeUnit(food.split(" "));
        if (u2 && !u) { u = u2; unitWord = uw2; food = w2.join(" "); }
        break;
      }
    }
  }
  if (food.startsWith("of ")) food = food.slice(3);
  return { q: q ?? 1, unit: u ? u.key : null, unitGrams: u ? u.grams : null, size, food: food.trim(), raw };
}

/* ---------- matching ---------- */
function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      best = Math.min(best, dp[i][j]);
    }
    if (best > max) return max + 1;
  }
  return dp[a.length][b.length];
}
const tolerance = (len: number) => (len >= 12 ? 3 : len >= 8 ? 2 : len >= 5 ? 1 : 0);
const tokensMatch = (a: string, b: string) => a === b || singulars(a).includes(b) || singulars(b).includes(a) || (a.length >= 5 && editDistance(a, b, 1) <= 1);

function lookup(food: string): FoodRow | null {
  for (const k of singulars(norm(food))) { const r = INDEX.get(k); if (r) return r; }
  return null;
}

export type Match =
  | { kind: "builtin"; row: FoodRow; how: "exact" | "fuzzy" }
  | { kind: "custom"; c: CustomFood; how: "exact" | "fuzzy" };

/** Find the best food for some text: your own foods first, then the built-in list, then near-matches. */
export function resolveFood(text: string, custom: Record<string, CustomFood> = {}): Match | null {
  const t = norm(text);
  if (!t) return null;
  for (const k of singulars(t)) if (custom[k]) return { kind: "custom", c: custom[k], how: "exact" };
  const exact = lookup(t);
  if (exact) return { kind: "builtin", row: exact, how: "exact" };

  // spelling mistakes ("chapathy", "biriyani", "sambhaar")
  let best: { key: string; d: number } | null = null;
  const tol = tolerance(t.length);
  if (tol) for (const k of KEYS) {
    const d = editDistance(t, k, tol);
    if (d <= tol && (!best || d < best.d)) best = { key: k, d };
  }
  for (const name of Object.keys(custom)) {
    const d = editDistance(t, name, tol);
    if (tol && d <= tol && (!best || d < best.d)) return { kind: "custom", c: custom[name], how: "fuzzy" };
  }
  if (best) return { kind: "builtin", row: INDEX.get(best.key)!, how: "fuzzy" };

  // word overlap ("chettinad chicken curry" → chicken chettinad, "hot filter coffee" → filter coffee)
  const tt = t.split(" ").filter((w) => w.length >= 2);
  let top: { key: string; score: number; cover: number } | null = null;
  for (const k of KEYS) {
    const kt = k.split(" ");
    let matched = 0, matchedLen = 0;
    for (const w of tt) {
      const hit = kt.find((x) => tokensMatch(w, x));
      if (hit) { matched++; matchedLen += hit.length; }
    }
    if (!matched) continue;
    const textCover = matched / tt.length, keyCover = Math.min(1, matched / kt.length);
    if (textCover < 0.6 || keyCover < 0.6) continue;
    const score = matchedLen + keyCover * 3;
    if (!top || score > top.score || (score === top.score && keyCover > top.cover)) top = { key: k, score, cover: keyCover };
  }
  if (top) return { kind: "builtin", row: INDEX.get(top.key)!, how: "fuzzy" };
  return null;
}

/* ---------- calculation ---------- */
export type Item = {
  raw: string;
  food: string; // the food words as typed
  label: string; // what it matched
  how: "exact" | "fuzzy" | "unknown";
  q: number;
  unit: string | null;
  size: number;
  grams: number | null;
  kcal: number;
  p: number; c: number; f: number; fib: number;
  src: string;
  est: boolean; // macros are estimated
};

function gramsForRow(row: FoodRow, p: ParsedItem): number {
  const def = row.portions[0];
  const portion = (key: string) => row.portions.find(([u]) => u === key)?.[1];
  let grams: number;
  if (p.unitGrams != null) grams = p.q * p.unitGrams; // g, ml, kg…
  else if (!p.unit || p.unit === "serving" || p.unit === "pc") {
    if (def[0] === "g") {
      // weight-tracked food: "paneer 150" = 150 g, but "2 chicken" = 2 pieces
      const second = row.portions[1]?.[1] ?? 100;
      if (p.unit === "pc") grams = p.q * (portion("pc") ?? second);
      else if (!p.unit && p.q > 10) grams = p.q;
      else grams = p.q * second;
    } else if (p.unit === "pc") grams = p.q * (portion("pc") ?? def[1]);
    else grams = p.q * def[1];
  } else {
    const g = portion(p.unit);
    if (g != null) grams = p.q * g;
    else {
      const liquid = row.portions.some(([u]) => u === "glass");
      grams = p.q * (p.unit === "cup" && liquid ? 240 : FALLBACK_G[p.unit] ?? def[1]);
    }
  }
  return grams * p.size;
}

const per100 = (row: { kcal: number; p: number; c: number; f: number; fib: number }, g: number) => ({
  kcal: (row.kcal * g) / 100, p: (row.p * g) / 100, c: (row.c * g) / 100, f: (row.f * g) / 100, fib: (row.fib * g) / 100,
});

/** Estimate protein/carbs/fat for a calorie number, from the most similar known food (or a typical Indian meal split). */
export function estimateMacros(kcal: number, hint: string): Macros {
  const m = resolveFood(hint) ?? looseMatch(hint);
  if (m && m.kind === "builtin" && m.row.kcal > 0) {
    const r = m.row, k = kcal / r.kcal;
    return { p: r.p * k, c: r.c * k, f: r.f * k, fib: r.fib * k };
  }
  // typical mixed Indian meal: 12% protein, 55% carbs, 33% fat
  return { p: (kcal * 0.12) / 4, c: (kcal * 0.55) / 4, f: (kcal * 0.33) / 9, fib: kcal * 0.01 };
}
function looseMatch(hint: string): Match | null {
  const words = norm(hint).split(" ").filter((w) => w.length >= 4);
  for (const w of words) {
    const r = lookup(w);
    if (r) return { kind: "builtin", row: r, how: "fuzzy" };
  }
  for (const w of words) for (const k of KEYS) if (k.split(" ").includes(w)) return { kind: "builtin", row: INDEX.get(k)!, how: "fuzzy" };
  return null;
}

export function calcItem(text: string, custom: Record<string, CustomFood> = {}, sizeOverride?: number): Item {
  const p = parseItem(text, custom);
  if (sizeOverride != null) p.size = sizeOverride;
  const base = { raw: p.raw, food: p.food, q: p.q, unit: p.unit, size: p.size };
  const m = p.food ? resolveFood(p.food, custom) : null;
  if (!m) return { ...base, label: p.food, how: "unknown", grams: null, kcal: 0, p: 0, c: 0, f: 0, fib: 0, src: "", est: false };

  if (m.kind === "builtin") {
    const grams = gramsForRow(m.row, p);
    return { ...base, label: m.row.name, how: m.how, grams, ...per100(m.row, grams), src: "built-in", est: false };
  }
  const c = m.c;
  const hasMacros = c.p != null && c.c != null && c.f != null;
  if (c.kcal100 != null) {
    const pseudo: FoodRow = {
      name: c.name, aliases: [], kcal: c.kcal100, p: c.p ?? 0, c: c.c ?? 0, f: c.f ?? 0, fib: c.fib ?? 0,
      portions: [["serving", c.serving_g ?? 100], ["g", 1]],
    };
    const grams = p.unitGrams != null ? p.q * p.unitGrams * p.size
      : p.unit && FALLBACK_G[p.unit] ? p.q * FALLBACK_G[p.unit] * p.size
      : p.q * (c.serving_g ?? 100) * p.size;
    const v = per100(pseudo, grams);
    const mac = hasMacros ? v : { kcal: v.kcal, ...estimateMacros(v.kcal, c.name) };
    return { ...base, label: c.name, how: m.how, grams, ...mac, kcal: v.kcal, src: c.src, est: !hasMacros };
  }
  // per-serving values
  let servings = p.q * p.size;
  if (p.unitGrams != null && c.serving_g) servings = (p.q * p.unitGrams * p.size) / c.serving_g;
  const kcal = servings * (c.kcal_serving ?? 0);
  const mac = hasMacros
    ? { p: servings * c.p!, c: servings * c.c!, f: servings * c.f!, fib: servings * (c.fib ?? 0) }
    : estimateMacros(kcal, c.name);
  return { ...base, label: c.name, how: m.how, grams: c.serving_g ? servings * c.serving_g : null, kcal, ...mac, src: c.src, est: !hasMacros };
}

/* ---------- several items in one line ---------- */
const isKnown = (chunk: string, custom: Record<string, CustomFood>) => {
  const p = parseItem(chunk, custom);
  return !!p.food && resolveFood(p.food, custom)?.how === "exact";
};
export function splitItems(text: string, custom: Record<string, CustomFood> = {}): string[] {
  const parts = text.split(/[,;\n+]|\s&\s/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (isKnown(part, custom)) { out.push(part); continue; }
    const sub = part.split(/\s+(?:and|with|n)\s+/i).map((s) => s.trim()).filter(Boolean);
    if (sub.length > 1 && sub.every((s) => isKnown(s, custom) || /\d/.test(s))) out.push(...sub);
    else out.push(part);
  }
  return out;
}

export function calcAll(text: string, custom: Record<string, CustomFood> = {}, sizes: Record<number, number> = {}): Item[] {
  return splitItems(text, custom).map((s, i) => calcItem(s, custom, sizes[i]));
}

/** Short text for a portion: "2 pc · 80 g". */
export function portionText(it: Item): string {
  const u = it.unit ? UNIT_LABEL[it.unit] ?? it.unit : null;
  const qty = `${+it.q.toFixed(2)}${u && u !== "g" ? " " + u : ""}`;
  const size = it.size !== 1 ? (it.size < 1 ? " small" : " large") : "";
  return it.grams ? `${qty}${size} · ${Math.round(it.grams)} g` : `${qty}${size}`;
}
