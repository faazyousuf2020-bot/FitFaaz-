// Food engine tests: run with `npm test`. CI runs these before building the APK.
// Each case: [what you type, food it should match (null = not found), expected kcal]. Passes within ±8%.
import { FOODS, calcAll, calcItem, estimateMacros, splitItems } from "../src/lib/foodEngine";
import type { CustomFood } from "../src/lib/types";

type Case = [string, string | null, number];
const CASES: Case[] = [
  // tiffin
  ["2 idli", "idli", 108], ["idli", "idli", 54], ["3 idlis", "idli", 162], ["4 idly", "idli", 216],
  ["1 plate idli", "idli", 108], ["2-3 idli", "idli", 135], ["1 dosa", "plain dosa", 136], ["dosa", "plain dosa", 136],
  ["2 dosai", "plain dosa", 272], ["dosa x2", "plain dosa", 272], ["masala dosa", "masala dosa", 324],
  ["ghee roast", "ghee roast", 286], ["1 ghee roast dosa", "ghee roast", 286], ["onion uthappam", "uthappam", 240],
  ["rava dosa", "rava dosa", 200], ["2 appam", "appam", 180], ["3 idiyappam", "idiyappam", 180],
  ["1 cup puttu", "puttu", 255], ["2 chapathi", "chapati", 224], ["3 chapati", "chapati", 336],
  ["chapati 4", "chapati", 448], ["4 rotis", "chapati", 448], ["2 parotta", "parotta", 594],
  ["1 kerala parotta", "parotta", 297], ["2 poori", "poori", 228], ["3 pooris", "poori", 342],
  ["pongal", "pongal", 280], ["1 cup pongal", "pongal", 280], ["1 katori pongal", "pongal", 210],
  ["upma", "upma", 260], ["1 plate upma", "upma", 325], ["poha", "poha", 240], ["2 vada", "medu vada", 240],
  ["1 medu vada", "medu vada", 120], ["2 vadai", "medu vada", 240], ["sambar vada", "sambar vada", 204],
  ["2 masala vada", "masala vada", 248], ["2 paniyaram", "paniyaram", 72], ["1 aloo paratha", "aloo paratha", 338],
  ["2 naan", "naan", 522], ["butter naan", "butter naan", 320], ["1 bread omelette", "bread omelette", 315],
  ["pesarattu", "pesarattu", 160], ["adai", "adai", 190], ["2 neer dosa", "neer dosa", 150],
  // curries & sides
  ["1 cup sambar", "sambar", 130], ["sambar", "sambar", 97.5], ["2 ladle sambar", "sambar", 78],
  ["1 bowl sambar", "sambar", 97.5], ["1 katori rasam", "rasam", 45], ["rasam", "rasam", 45],
  ["1 katori dal", "dal", 157.5], ["dal 300g", "dal", 315], ["dal", "dal", 157.5], ["½ cup dal", "dal", 105],
  ["paruppu", "dal", 157.5], ["dhal", "dal", 157.5], ["chicken curry", "chicken curry", 225],
  ["1 cup chicken curry", "chicken curry", 300], ["chiken curry", "chicken curry", 225],
  ["chettinad chicken curry", "chicken chettinad", 262.5], ["mutton curry", "mutton curry", 277.5],
  ["fish curry", "fish curry", 180], ["egg curry", "egg curry", 202.5], ["chana masala", "chana masala", 210],
  ["rajma", "rajma", 180], ["paneer butter masala", "paneer butter masala", 315], ["palak paneer", "palak paneer", 225],
  ["kootu", "kootu", 112.5], ["poriyal", "poriyal", 90], ["beans poriyal", "poriyal", 90], ["avial", "avial", 157.5],
  ["veg kurma", "kurma", 165], ["vatha kuzhambu", "vatha kuzhambu", 105], ["mor kuzhambu", "mor kuzhambu", 105],
  ["coconut chutney", "coconut chutney", 27], ["2 tbsp coconut chutney", "coconut chutney", 54],
  ["1 katori coconut chutney", "coconut chutney", 108], ["tomato chutney", "tomato chutney", 13.5],
  ["1 tsp pickle", "pickle", 9.5], ["2 papad", "papad", 108], ["appalam", "papad", 54], ["raita", "raita", 90],
  ["curd", "curd", 90], ["1 cup curd", "curd", 144], ["salad", "salad", 25],
  // rice & mains
  ["150g biryani", "chicken biryani", 262.5], ["biryani 200g", "chicken biryani", 350],
  ["1 plate biryani", "chicken biryani", 700], ["half plate biryani", "chicken biryani", 350],
  ["chicken biryani", "chicken biryani", 350], ["mutton biryani 1 plate", "mutton biryani", 780],
  ["veg biryani", "veg biryani", 320], ["1 plate meals", "meals", 900], ["meals", "meals", 900],
  ["sapadu", "meals", 900], ["white rice 1 cup", "white rice", 208], ["1 cup rice", "white rice", 208],
  ["rice", "white rice", 208], ["2 cups rice", "white rice", 416], ["200g rice", "white rice", 260],
  ["half cup rice", "white rice", 104], ["1/2 cup rice", "white rice", 104], ["1.5 cup rice", "white rice", 312],
  ["1 1/2 cups rice", "white rice", 312], ["1 bowl rice", "white rice", 195], ["curd rice", "curd rice", 230],
  ["1 cup curd rice", "curd rice", 230], ["curd rise", "curd rice", 230], ["thair sadam", "curd rice", 230],
  ["lemon rice", "lemon rice", 297], ["puliyodharai", "tamarind rice", 324], ["sambar rice", "sambar rice", 275],
  ["1 plate fried rice", "fried rice", 495], ["chicken fried rice", "chicken fried rice", 324],
  ["1 plate noodles", "noodles", 510], ["maggi", "maggi", 308], ["1 packet maggi", "maggi", 308],
  ["1 bowl maggi", "maggi", 308], ["ragi mudde", "ragi mudde", 220], ["ragi", "ragi mudde", 220],
  ["1 ragi ball", "ragi mudde", 220], ["2 ragi balls", "ragi mudde", 440], ["ragi kanji", "ragi kanji", 137.5],
  ["1 glass ragi malt", "ragi kanji", 137.5], ["kambu koozh", "kambu koozh", 137.5], ["kanji", "rice kanji", 108],
  ["millet pongal", "millet pongal", 270], ["thinai sadam", "millet rice", 192],
  // eggs, meat, fish
  ["egg", "egg", 77.5], ["2 eggs", "egg", 155], ["egg 3", "egg", 232.5], ["3 boiled eggs", "egg", 232.5],
  ["2 egg whites", "egg white", 34.3], ["omelette", "omelette", 108], ["omlette", "omelette", 108],
  ["half boil", "half boil", 107], ["2 large eggs", "egg", 217], ["egg bhurji", "egg bhurji", 180],
  ["chicken 65", "chicken 65", 62.5], ["6 chicken 65", "chicken 65", 375], ["1 plate chicken 65", "chicken 65", 375],
  ["fish fry", "fish fry", 176], ["2 fish fry", "fish fry", 352], ["grilled chicken", "grilled chicken", 204],
  ["chicken 200g", "chicken", 380], ["2 pieces chicken", "chicken", 228], ["chicken breast 150g", "chicken breast", 247.5],
  ["tandoori chicken", "grilled chicken", 204], ["shawarma", "chicken shawarma", 550], ["prawn fry", "prawn fry", 210],
  ["mutton fry", "mutton fry", 250], ["1 piece fish", "fish", 130],
  // dairy & protein
  ["milk 100ml", "milk", 62], ["1 glass milk", "milk", 155], ["milk", "milk", 148.8], ["200 ml milk", "milk", 124],
  ["1 tumbler milk", "milk", 93], ["paneer 100g", "paneer", 265], ["100 g paneer", "paneer", 265],
  ["paneer 150", "paneer", 397.5], ["panner", "paneer", 265], ["1 scoop whey", "whey protein", 121.6],
  ["whey protein", "whey protein", 121.6], ["1 scoop protein powder", "whey protein", 121.6],
  ["1 cup sprouts", "sprouts", 35], ["sundal", "sundal", 210], ["1 tbsp peanut butter", "peanut butter", 94.4],
  ["1 glass buttermilk", "buttermilk", 50], ["lassi", "lassi", 250], ["oats", "oats", 152], ["40g oats", "oats", 152],
  ["1 bowl oats", "oats", 152], ["oats porridge", "oats porridge", 168], ["soya chunks 50g", "soya chunks", 172.5],
  // drinks
  ["tea", "tea", 75], ["2 tea", "tea", 150], ["1 cup tea", "tea", 75], ["masala chai", "tea", 75],
  ["tea with milk", "tea", 75], ["1 cup coffee", "filter coffee", 82.5], ["2 cups coffee", "filter coffee", 165],
  ["1 tumbler coffee", "filter coffee", 82.5], ["hot filter coffee", "filter coffee", 82.5],
  ["black coffee", "black coffee", 3], ["green tea", "black tea", 1.5], ["tender coconut", "tender coconut", 47.5],
  ["1 can coke", "soft drink", 138.6], ["1 glass orange juice", "orange juice", 112.5],
  ["fresh lime soda", "fresh lime soda", 87.5], ["lemon juice", "fresh lime soda", 87.5],
  ["1 bottle beer", "beer", 279.5], ["1 peg whisky", "whisky", 75], ["2 pegs whisky", "whisky", 150],
  ["boost", "boost", 170], ["badam milk", "badam milk", 275], ["sugarcane juice", "sugarcane juice", 175],
  // fruit & nuts
  ["banana", "banana", 106.8], ["2 bananas", "banana", 213.6], ["Banana 30gm", "banana", 26.7],
  ["large banana", "banana", 149.5], ["1 apple", "apple", 93.6], ["small apple", "apple", 65.5],
  ["1 cup papaya", "papaya", 62.35], ["10 almonds", "almonds", 69.5], ["almonds 10", "almonds", 69.5],
  ["handful almonds", "almonds", 162], ["a handful of peanuts", "groundnuts", 170], ["5 cashews", "cashews", 41.5],
  ["2 dates", "dates", 45], ["1 guava", "guava", 68], ["1 cup grapes", "grapes", 103.5], ["1 mango", "mango", 120],
  ["watermelon", "watermelon", 45], ["1 orange", "orange", 61], ["pomegranate", "pomegranate", 141],
  // fats, sugar
  ["1 tbsp ghee", "ghee", 126], ["1 tsp ghee", "ghee", 45], ["1 tsp sugar", "sugar", 16], ["2 tsp sugar", "sugar", 32],
  ["1 tsp oil", "oil", 44.2], ["1 tsp honey", "honey", 21.3], ["2 tsp jaggery", "jaggery", 38],
  // snacks & sweets
  ["samosa", "samosa", 217], ["2 samosa", "samosa", 434], ["1 puff", "puffs", 270], ["egg puff", "puffs", 270],
  ["1 slice pizza", "pizza", 260], ["2 pizza slices", "pizza", 520], ["burger", "burger", 450],
  ["chicken burger", "chicken burger", 520], ["french fries", "french fries", 217], ["lays", "potato chips", 280.8],
  ["1 packet lays", "potato chips", 280.8], ["5 biscuits", "biscuit", 188], ["2 marie biscuit", "biscuit", 75.2],
  ["1 piece cake", "cake", 228], ["gulab jamun", "gulab jamun", 128], ["2 gulab jamun", "gulab jamun", 256],
  ["1 laddu", "laddu", 172], ["mysore pak", "mysore pak", 168], ["1 cup payasam", "payasam", 225],
  ["ice cream", "ice cream", 144.9], ["1 scoop ice cream", "ice cream", 134.6], ["dark chocolate 20g", "dark chocolate", 110],
  ["1 kitkat", "chocolate", 214], ["6 pani puri", "pani puri", 216], ["1 plate pani puri", "pani puri", 216],
  ["onion pakoda", "onion pakoda", 80], ["1 plate onion pakoda", "onion pakoda", 384], ["murukku", "murukku", 104],
  ["mixture", "mixture", 162], ["2 bajji", "bajji", 168], ["banana chips", "banana chips", 156],
  ["tapioca chips", "tapioca chips", 150],
  // typos
  ["chapathy", "chapati", 112], ["parota", "parotta", 297], ["sambhaar", "sambar", 97.5], ["biriyani", "chicken biryani", 350],
  ["briyani", "chicken biryani", 350], ["pongol", "pongal", 280], ["idlly", "idli", 54], ["dosaa", "plain dosa", 136],
  // unknown
  ["xyzabc", null, 0], ["curry", null, 0],
];

const CUSTOM: Record<string, CustomFood> = {
  "ice tea": { name: "ice tea", kcal_serving: 150, kcal100: null, serving_g: null, src: "your value", p: null, c: null, f: null, fib: null, barcode: null },
  "ragi": { name: "ragi", kcal_serving: 400, kcal100: null, serving_g: null, src: "your value", p: null, c: null, f: null, fib: null, barcode: null },
  "maggi masala": { name: "maggi masala", kcal_serving: null, kcal100: 450, serving_g: 70, src: "barcode", p: 9, c: 60, f: 18, fib: 3, barcode: "8901058000290" },
};
const CUSTOM_CASES: Case[] = [
  ["ice tea", "ice tea", 150], ["2 ice tea", "ice tea", 300], ["ragi", "ragi", 400],
  ["1 maggi masala", "maggi masala", 315], ["100g maggi masala", "maggi masala", 450], ["2 maggi masala", "maggi masala", 630],
];

const SPLIT: [string, number, number][] = [
  // text, number of items, total kcal
  ["2 idli, 1 cup sambar", 2, 238], ["2 idli and sambar", 2, 205.5], ["3 chapati with dal", 2, 493.5],
  ["rice and sambar", 2, 305.5], ["tea with milk", 1, 75], ["chicken biryani with raita", 2, 440],
  ["2 idli, 1 vada, coconut chutney", 3, 255], ["oats with milk", 2, 300.8], ["mac and cheese", 1, 310],
  ["2 dosa + sambar + chutney", 3, 396.5], ["3 chapati; dal; 1 cup curd", 3, 637.5],
];

let pass = 0, fail = 0;
const near = (a: number, b: number) => (b === 0 ? a === 0 : Math.abs(a - b) / b <= 0.08);
function check(text: string, label: string | null, kcal: number, custom: Record<string, CustomFood> = {}) {
  const it = calcItem(text, custom);
  const ok = label === null ? it.how === "unknown" : it.label === label && near(it.kcal, kcal);
  if (ok) pass++;
  else { fail++; console.log(`✗ "${text}" → ${it.label} (${it.how}) ${Math.round(it.kcal)} kcal, ${it.grams ? Math.round(it.grams) + " g" : "-"}; expected ${label} ${kcal}`); }
}
CASES.forEach(([t, l, k]) => check(t, l, k));
CUSTOM_CASES.forEach(([t, l, k]) => check(t, l, k, CUSTOM));
for (const [t, n, k] of SPLIT) {
  const items = calcAll(t);
  const total = items.reduce((a, i) => a + i.kcal, 0);
  if (items.length === n && items.every((i) => i.how !== "unknown") && near(total, k)) pass++;
  else { fail++; console.log(`✗ split "${t}" → ${JSON.stringify(splitItems(t))} ${Math.round(total)} kcal; expected ${n} items ${k}`); }
}

// macros come out for every matched item and add up to roughly the calories
for (const [t, l] of CASES) {
  if (!l) continue;
  const it = calcItem(t);
  if (it.how === "unknown") continue;
  const fromMacros = 4 * it.p + 4 * (it.c - it.fib) + 2 * it.fib + 9 * it.f;
  const isAlcohol = ["beer", "whisky", "wine"].includes(it.label);
  if (!isAlcohol && it.kcal > 30 && Math.abs(fromMacros - it.kcal) / it.kcal > 0.2) {
    fail++; console.log(`✗ macros "${t}": ${Math.round(fromMacros)} from macros vs ${Math.round(it.kcal)} kcal`);
  } else pass++;
}
// estimated macros
for (const [hint, kcal] of [["ragi kanji", 300], ["unknown thing", 500], ["chicken something", 400]] as [string, number][]) {
  const m = estimateMacros(kcal, hint);
  const back = 4 * m.p + 4 * m.c + 9 * m.f;
  if (m.p > 0 && m.c >= 0 && Math.abs(back - kcal) / kcal < 0.25) pass++;
  else { fail++; console.log(`✗ estimate "${hint}"`, m); }
}

// the table itself: no duplicate names, sane numbers, macros match calories
const seen = new Map<string, string>();
for (const r of FOODS) {
  for (const k of [r.name, ...r.aliases]) {
    const key = k.toLowerCase();
    if (seen.has(key) && seen.get(key) !== r.name) { fail++; console.log(`✗ duplicate name "${key}" in ${seen.get(key)} and ${r.name}`); }
    seen.set(key, r.name);
  }
  const at = 4 * r.p + 4 * (r.c - r.fib) + 2 * r.fib + 9 * r.f;
  const alcohol = ["beer", "wine", "whisky"].includes(r.name);
  if (!alcohol && r.kcal > 20 && Math.abs(at - r.kcal) > Math.max(12, r.kcal * 0.15)) { fail++; console.log(`✗ table "${r.name}": ${r.kcal} kcal vs ${Math.round(at)} from macros`); }
  else pass++;
}

console.log(`\n${FOODS.length} foods in the table · ${pass} checks passed · ${fail} failed`);
if (fail) process.exit(1);
