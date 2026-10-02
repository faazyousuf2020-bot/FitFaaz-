// Meals and online lookups (Open Food Facts). Calculation lives in foodEngine.ts.

export const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
export const mealNow = () => {
  const h = new Date().getHours();
  return h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 19 ? "snacks" : "dinner";
};

export type OnlineFood = {
  name: string;
  kcal100: number;
  p: number | null; c: number | null; f: number | null; fib: number | null; // per 100 g
  serving_g: number | null;
  barcode?: string;
};

const UA = { "User-Agent": "FitFaaz/1.0 (Android; personal use)" };
const FIELDS = "product_name,product_name_en,brands,nutriments,serving_quantity,code";

function toFood(p: any): OnlineFood | null {
  const n = p?.nutriments ?? {};
  let k = n["energy-kcal_100g"];
  if (k == null && n["energy_100g"] != null) k = n["energy_100g"] / 4.184;
  const title = String(p?.product_name || p?.product_name_en || "").trim();
  if (k == null || !title) return null;
  const num = (v: any) => (v == null || v === "" || isNaN(+v) ? null : +v);
  const sq = parseFloat(p.serving_quantity);
  return {
    name: `${title}${p.brands ? ` · ${String(p.brands).split(",")[0].trim()}` : ""}`,
    kcal100: Math.round(+k),
    p: num(n.proteins_100g), c: num(n.carbohydrates_100g), f: num(n.fat_100g), fib: num(n.fiber_100g),
    serving_g: isFinite(sq) && sq > 0 ? sq : null,
    barcode: p.code ? String(p.code) : undefined,
  };
}

/** Search Open Food Facts by name (mostly packaged products). */
export async function searchOFF(query: string, signal?: AbortSignal): Promise<OnlineFood[]> {
  const url = "https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=20" +
    `&fields=${FIELDS}&search_terms=` + encodeURIComponent(query);
  const res = await fetch(url, { signal, headers: UA });
  if (!res.ok) throw new Error("search failed");
  const json = await res.json();
  const out: OnlineFood[] = [];
  const seen = new Set<string>();
  for (const p of json.products ?? []) {
    const f = toFood(p);
    if (!f || seen.has(f.name.toLowerCase())) continue;
    seen.add(f.name.toLowerCase());
    out.push(f);
    if (out.length >= 6) break;
  }
  return out;
}

/** Look a barcode up on Open Food Facts. Returns null if the product isn't there. */
export async function fetchBarcode(code: string): Promise<OnlineFood | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`, { headers: UA });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("lookup failed");
  const json = await res.json();
  if (json.status === 0 || !json.product) return null;
  const f = toFood(json.product);
  return f ? { ...f, barcode: code } : null;
}
