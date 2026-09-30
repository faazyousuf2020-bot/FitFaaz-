import type { CustomFood } from "./types";

// name: [aliases, natural unit, grams per natural unit, kcal per natural unit]
type LocalFood = [string[], string, number, number];
export const LOCAL: Record<string, LocalFood> = {
  // tiffin
  "idli": [["idly", "idlis", "idlies", "idlys"], "piece", 40, 58],
  "plain dosa": [["dosa", "dosai", "thosai", "dosas"], "piece", 80, 130],
  "masala dosa": [["masal dosa"], "piece", 175, 250],
  "ghee roast": [["ghee dosa", "ghee roast dosa"], "piece", 100, 220],
  "onion uthappam": [["uthappam", "uttapam", "oothappam"], "piece", 150, 210],
  "rava dosa": [[], "piece", 100, 180],
  "pesarattu": [[], "piece", 100, 150],
  "adai": [[], "piece", 100, 190],
  "medu vada": [["vada", "vadai", "ulundu vadai", "vadas"], "piece", 40, 97],
  "masala vada": [["paruppu vadai", "dal vada"], "piece", 40, 110],
  "chapati": [["chapathi", "roti", "chapatis", "chapathis", "phulka"], "piece", 40, 104],
  "parotta": [["porotta", "barotta"], "piece", 90, 260],
  "aloo paratha": [["paratha"], "piece", 120, 290],
  "poori": [["puri", "pooris", "puris"], "piece", 30, 101],
  "appam": [["appams"], "piece", 60, 120],
  "idiyappam": [["string hoppers", "idiappam"], "piece", 40, 70],
  "puttu": [[], "cup", 150, 240],
  "pongal": [["ven pongal", "khara pongal"], "cup", 200, 280],
  "sweet pongal": [["sakkarai pongal"], "cup", 200, 400],
  "upma": [["rava upma", "uppuma"], "cup", 200, 250],
  "kichadi": [["khichdi", "rava kichadi"], "cup", 200, 260],
  "poha": [["aval"], "cup", 150, 250],
  "semiya upma": [["vermicelli upma"], "cup", 200, 240],
  "bread": [["bread slice", "white bread"], "slice", 30, 80],
  "brown bread": [["wheat bread"], "slice", 30, 75],
  "oats": [["oatmeal", "oats porridge"], "cup", 240, 160],
  "cornflakes": [["corn flakes"], "cup", 30, 110],
  // rice & mains
  "white rice": [["rice", "sadam", "saadam", "cooked rice", "steamed rice"], "cup", 160, 205],
  "brown rice": [[], "cup", 160, 215],
  "curd rice": [["thayir sadam", "thayir sadham", "yogurt rice"], "cup", 200, 220],
  "lemon rice": [["elumichai sadam"], "cup", 180, 290],
  "tamarind rice": [["puliyodharai", "puliyogare", "puli sadam"], "cup", 180, 320],
  "tomato rice": [["thakkali sadam"], "cup", 180, 280],
  "coconut rice": [["thengai sadam"], "cup", 180, 330],
  "sambar rice": [["sambar sadam", "bisibele bath", "bisi bele bath"], "cup", 220, 300],
  "veg pulao": [["pulao", "pulav"], "cup", 180, 280],
  "ghee rice": [["neychoru"], "cup", 180, 350],
  "chicken biryani": [["biryani", "briyani", "chicken briyani"], "cup", 200, 350],
  "mutton biryani": [["mutton briyani"], "cup", 200, 400],
  "veg biryani": [["vegetable biryani", "veg briyani"], "cup", 200, 290],
  "egg biryani": [["egg briyani"], "cup", 200, 320],
  "fried rice": [["veg fried rice"], "cup", 180, 330],
  "chicken fried rice": [[], "cup", 180, 380],
  "noodles": [["veg noodles", "hakka noodles"], "cup", 180, 330],
  "meals": [["south indian meals", "full meals", "thali"], "plate", 700, 850],
  // curries
  "sambar": [["sambhar"], "cup", 200, 130],
  "rasam": [[], "cup", 200, 60],
  "dal": [["paruppu", "dal fry", "dhal"], "cup", 200, 200],
  "kootu": [["koottu"], "cup", 150, 140],
  "poriyal": [["thoran", "vegetable poriyal"], "cup", 150, 120],
  "avial": [["aviyal"], "cup", 150, 160],
  "kurma": [["veg kurma", "korma"], "cup", 200, 220],
  "vatha kuzhambu": [["vathal kuzhambu", "kara kuzhambu"], "cup", 150, 170],
  "mor kuzhambu": [["more kuzhambu"], "cup", 200, 150],
  "chana masala": [["chole", "channa masala"], "cup", 200, 270],
  "rajma": [[], "cup", 200, 240],
  "paneer butter masala": [["paneer masala"], "cup", 200, 400],
  "palak paneer": [[], "cup", 200, 300],
  "chicken curry": [["chicken kuzhambu", "chicken gravy"], "cup", 200, 280],
  "chicken chettinad": [["chettinad chicken"], "cup", 200, 320],
  "butter chicken": [[], "cup", 200, 430],
  "chicken 65": [[], "piece", 30, 75],
  "grilled chicken": [["tandoori chicken"], "g", 1, 1.65],
  "chicken breast": [[], "g", 1, 1.65],
  "mutton curry": [["mutton kuzhambu", "mutton gravy"], "cup", 200, 380],
  "fish curry": [["meen kuzhambu", "fish kuzhambu"], "cup", 200, 240],
  "fish fry": [["meen varuval", "fried fish"], "piece", 100, 220],
  "egg curry": [["egg kuzhambu", "egg masala"], "cup", 200, 260],
  "prawn masala": [["prawn curry", "eral"], "cup", 200, 260],
  // chutneys & sides
  "coconut chutney": [["chutney", "thengai chutney"], "tbsp", 15, 35],
  "tomato chutney": [["thakkali chutney"], "tbsp", 15, 25],
  "pickle": [["oorugai", "achar"], "tsp", 5, 15],
  "papad": [["appalam", "pappadam", "papadum"], "piece", 10, 50],
  "curd": [["thayir", "yogurt", "dahi"], "cup", 240, 150],
  "raita": [["pachadi"], "cup", 150, 100],
  "buttermilk": [["mor", "moru", "chaas"], "glass", 250, 40],
  "ghee": [["nei"], "tsp", 5, 45],
  "butter": [[], "tsp", 5, 36],
  "oil": [["cooking oil"], "tsp", 5, 40],
  "sugar": [[], "tsp", 4, 16],
  "honey": [[], "tsp", 7, 21],
  "jam": [[], "tbsp", 20, 55],
  "peanut butter": [[], "tbsp", 16, 95],
  // drinks
  "milk": [["paal"], "cup", 240, 150],
  "tea": [["chai", "tea with milk"], "cup", 150, 70],
  "black tea": [["green tea"], "cup", 150, 2],
  "filter coffee": [["coffee", "kaapi"], "cup", 150, 90],
  "black coffee": [[], "cup", 150, 2],
  "boost": [["horlicks", "bournvita", "health drink"], "cup", 200, 170],
  "badam milk": [["badam paal"], "glass", 250, 230],
  "lassi": [["sweet lassi"], "glass", 250, 250],
  "fresh lime soda": [["lime juice", "lemon juice", "nimbu pani"], "glass", 250, 90],
  "tender coconut": [["elaneer", "coconut water", "ilaneer"], "glass", 250, 45],
  "orange juice": [["juice", "fruit juice"], "glass", 250, 115],
  "sugarcane juice": [["karumbu juice"], "glass", 250, 180],
  "soft drink": [["coke", "pepsi", "cola", "soda"], "glass", 300, 130],
  "beer": [[], "glass", 330, 150],
  // eggs & protein
  "boiled egg": [["egg", "eggs", "boiled eggs", "muttai"], "piece", 50, 78],
  "egg white": [["egg whites"], "piece", 33, 17],
  "omelette": [["omelet", "egg omelette"], "piece", 60, 110],
  "egg bhurji": [["scrambled eggs", "egg podimas"], "cup", 150, 280],
  "paneer": [[], "g", 1, 2.65],
  "tofu": [[], "g", 1, 0.76],
  "sprouts": [["sprouted moong"], "cup", 100, 30],
  "sundal": [["chana sundal", "channa sundal"], "cup", 150, 200],
  "whey protein": [["protein shake", "whey"], "piece", 32, 120],
  // snacks
  "samosa": [["samosas"], "piece", 60, 260],
  "bajji": [["bajji", "pakoda", "pakora", "bhajji", "vazhakkai bajji"], "piece", 30, 90],
  "bonda": [["aloo bonda", "mysore bonda"], "piece", 40, 130],
  "murukku": [["chakli"], "piece", 20, 100],
  "mixture": [["namkeen"], "cup", 50, 270],
  "banana chips": [["chips"], "cup", 50, 260],
  "potato chips": [["lays"], "cup", 30, 160],
  "biscuit": [["biscuits", "marie biscuit", "cookie", "cookies"], "piece", 8, 38],
  "cake": [["cake slice"], "slice", 60, 240],
  "puffs": [["veg puff", "egg puff", "puff"], "piece", 80, 280],
  "sandwich": [["veg sandwich"], "piece", 150, 300],
  "burger": [[], "piece", 200, 450],
  "pizza": [["pizza slice"], "slice", 100, 270],
  "popcorn": [[], "cup", 10, 35],
  "peanuts": [["groundnuts", "kadalai"], "g", 1, 5.7],
  "almonds": [["badam"], "piece", 1.2, 7],
  "cashews": [["cashew", "mundhiri"], "piece", 1.5, 9],
  "dates": [["pericham pazham", "date"], "piece", 8, 23],
  // sweets
  "mysore pak": [[], "piece", 30, 170],
  "laddu": [["ladoo", "laddoo", "boondi laddu"], "piece", 40, 185],
  "jalebi": [["jangiri"], "piece", 30, 150],
  "gulab jamun": [["gulab jamoon"], "piece", 40, 150],
  "payasam": [["kheer", "semiya payasam"], "cup", 150, 260],
  "kesari": [["rava kesari"], "cup", 100, 300],
  "halwa": [[], "cup", 100, 350],
  "ice cream": [["icecream"], "cup", 70, 140],
  "dark chocolate": [["chocolate"], "g", 1, 5.5],
  // fruit & veg
  "banana": [["bananas", "vazhaipazham"], "piece", 120, 105],
  "apple": [["apples"], "piece", 180, 95],
  "orange": [["oranges"], "piece", 130, 60],
  "mango": [["mangoes", "maampazham"], "piece", 200, 130],
  "papaya": [[], "cup", 145, 62],
  "watermelon": [[], "cup", 150, 46],
  "guava": [["koyya"], "piece", 100, 68],
  "grapes": [[], "cup", 150, 104],
  "pomegranate": [["mathulai"], "cup", 170, 144],
  "pineapple": [[], "cup", 165, 82],
  "chikoo": [["sapota"], "piece", 100, 83],
  "salad": [["green salad", "vegetable salad"], "cup", 100, 25],
  "cucumber": [[], "piece", 200, 30],
  "carrot": [["carrots"], "piece", 60, 25],
  "sweet potato": [["sakkaravalli kizhangu"], "piece", 130, 115],
  "boiled potato": [["potato"], "piece", 150, 130],
};

const UNITS: Record<string, [string, number | null]> = {};
([
  [["g", "gm", "gms", "gram", "grams", "gr"], "g", 1],
  [["kg"], "g", 1000],
  [["ml"], "ml", 1],
  [["l", "litre", "liter", "litres", "liters"], "ml", 1000],
  [["cup", "cups"], "cup", 240],
  [["bowl", "bowls", "katori"], "bowl", 200],
  [["plate", "plates"], "plate", 300],
  [["glass", "glasses"], "glass", 250],
  [["tbsp", "spoon", "spoons", "tablespoon", "tablespoons"], "tbsp", 15],
  [["tsp", "teaspoon", "teaspoons"], "tsp", 5],
  [["slice", "slices"], "slice", 30],
  [["scoop", "scoops"], "scoop", 32],
  [["piece", "pieces", "pc", "pcs", "nos", "no"], "piece", null],
] as [string[], string, number | null][]).forEach(([ws, c, g]) => ws.forEach((w) => (UNITS[w] = [c, g])));

const WORDS: Record<string, number> = { half: 0.5, a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
export const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
export const mealNow = () => {
  const h = new Date().getHours();
  return h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 19 ? "snacks" : "dinner";
};

export type Parsed = { q: number; unit: string | null; food: string };
export function parseFood(text: string): Parsed {
  const t = text.toLowerCase().trim().replace(/\s+/g, " ");
  // allow "100g rice" / "2cups tea"
  const m = t.match(/^(\d+\s*\/\s*\d+|\d*\.?\d+|[a-z]+)?\s*(.*)$/)!;
  let q: number | null = null;
  let rest = m[2];
  if (m[1]) {
    if (m[1].includes("/")) { const [a, b] = m[1].split("/"); q = +a / +b; }
    else if (!isNaN(+m[1])) q = +m[1];
    else if (WORDS[m[1]] !== undefined) q = WORDS[m[1]];
    else rest = t;
  }
  const words = rest.split(" ").filter(Boolean);
  let unit: string | null = null;
  // trailing amounts: "biryani 200g", "milk 1 cup", "tea 2"
  if (q === null && words.length > 1 && !matchLocal(words.join(" "))) {
    const joined = words.join(" ");
    const tm = joined.match(/^(.+?)\s+(\d*\.?\d+)\s*([a-z]+)?$/);
    if (tm && (!tm[3] || UNITS[tm[3]])) {
      q = +tm[2];
      return { q, unit: tm[3] ?? null, food: tm[1] };
    }
  }
  if (words.length > 1 && UNITS[words[0]]) {
    unit = words.shift()!;
    if (words[0] === "of") words.shift();
  }
  return { q: q ?? 1, unit, food: words.join(" ") };
}

export const matchLocal = (food: string) =>
  Object.entries(LOCAL).find(([n, [al]]) => food === n || al.includes(food))?.[0] ?? null;

export type Calc =
  | (Parsed & { unknown: true })
  | (Parsed & { unknown?: false; label: string; kcal: number; grams: number | null; src: string });

const gramsFor = (p: Parsed, naturalGrams: number | null) => {
  if (!p.unit) return naturalGrams != null ? p.q * naturalGrams : null;
  const [canon, g] = UNITS[p.unit];
  if (canon === "piece") return naturalGrams != null ? p.q * naturalGrams : null;
  return p.q * (g ?? naturalGrams ?? 100);
};

export function foodCalc(text: string, custom: Record<string, CustomFood>): Calc | null {
  const p = parseFood(text);
  if (!p.food) return null;
  const c = custom[p.food];
  if (c) {
    if (c.kcal100 != null) {
      const grams = gramsFor(p, c.serving_g ?? 100)!;
      return { ...p, label: p.food, grams, kcal: (c.kcal100 / 100) * grams, src: c.src };
    }
    return { ...p, label: p.food, grams: null, kcal: p.q * (c.kcal_serving ?? 0), src: c.src };
  }
  const name = matchLocal(p.food);
  if (!name) return { ...p, unknown: true };
  const [, lu, lg, lk] = LOCAL[name];
  if (lu === "g") {
    // foods tracked by weight; bare number means grams
    const grams = p.unit ? gramsFor(p, 100)! : p.q;
    return { ...p, label: name, grams, kcal: lk * grams, src: "built-in" };
  }
  const canon = p.unit ? UNITS[p.unit][0] : null;
  let grams: number, kcal: number;
  if (!canon || canon === lu || canon === "piece") { grams = p.q * lg; kcal = p.q * lk; }
  else { grams = gramsFor(p, lg)!; kcal = (lk / lg) * grams; }
  return { ...p, label: name, kcal, grams, src: "built-in" };
}

export type OffResult = { name: string; kcal100: number; serving_g: number | null };

/** Search Open Food Facts for calories per 100 g. */
export async function searchOFF(query: string, signal?: AbortSignal): Promise<OffResult[]> {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=20" +
    "&fields=product_name,brands,nutriments,serving_quantity&search_terms=" + encodeURIComponent(query);
  const res = await fetch(url, { signal, headers: { "User-Agent": "FitFaaz/1.0 (Android; personal use)" } });
  if (!res.ok) throw new Error("search failed");
  const json = await res.json();
  const out: OffResult[] = [];
  const seen = new Set<string>();
  for (const p of json.products ?? []) {
    const n = p.nutriments ?? {};
    let k = n["energy-kcal_100g"];
    if (k == null && n["energy_100g"] != null) k = n["energy_100g"] / 4.184;
    if (k == null || !p.product_name) continue;
    const name = `${String(p.product_name).trim()}${p.brands ? ` · ${String(p.brands).split(",")[0].trim()}` : ""}`;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const sq = parseFloat(p.serving_quantity);
    out.push({ name, kcal100: Math.round(+k), serving_g: isFinite(sq) && sq > 0 ? sq : null });
    if (out.length >= 6) break;
  }
  return out;
}
