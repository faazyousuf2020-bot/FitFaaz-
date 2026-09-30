export const pad = (n: number) => String(n).padStart(2, "0");
export const localISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => localISO(new Date());
export const dayISO = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return localISO(d);
};
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localISO(d);
};
export const nowHM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const fmtClock = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`;
};
export const fmtDur = (s: number) => {
  s = Math.round(s);
  const m = Math.floor(s / 60), x = s % 60;
  return m ? (x ? `${m}m ${pad(x)}s` : `${m} min`) : `${x}s`;
};
export const fmtPace = (secs: number, m: number) => {
  if (m < 50) return "--:--";
  const spk = secs / (m / 1000);
  if (!isFinite(spk) || spk > 5999) return "--:--";
  return `${Math.floor(spk / 60)}:${pad(Math.floor(spk % 60))}`;
};
export const n0 = (v: number) => Math.round(v || 0).toLocaleString("en-IN");
export const short = (v: number) =>
  v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : String(Math.round(v * 10) / 10);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const asDate = (iso: string) => new Date(iso + "T00:00:00");
/** "5 Oct" */
export const dShort = (iso: string) => { const d = asDate(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
/** "5" */
export const dNum = (iso: string) => String(asDate(iso).getDate());
/** "Mon" */
export const dWd = (iso: string) => WD_SHORT[asDate(iso).getDay()];
/** "Monday" */
export const dWdLong = (iso: string) => WD_LONG[asDate(iso).getDay()];
/** "Mon, 5 Oct" */
export const dMed = (iso: string) => `${dWd(iso)}, ${dShort(iso)}`;
/** "Monday, 5 Oct" */
export const dLong = (iso: string) => `${dWdLong(iso)}, ${dShort(iso)}`;

export const cap1 = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const sum = <T,>(arr: T[], f: (x: T) => number) => arr.reduce((a, x) => a + (f(x) || 0), 0);
export const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);
export const rangeDays = (n: number) => [...Array(n)].map((_, i) => dayISO(n - 1 - i));
export const weekStart = (iso: string) => {
  const d = asDate(iso);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return localISO(d);
};
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10) * p;
}
export function linReg(vals: number[]): [number, number] {
  const n = vals.length;
  if (n < 2) return [vals[0], vals[0]];
  const mx = (n - 1) / 2, my = sum(vals, (v) => v) / n;
  let num = 0, den = 0;
  vals.forEach((v, x) => { num += (x - mx) * (v - my); den += (x - mx) ** 2; });
  const b = num / den;
  return [my - b * mx, my + b * (n - 1 - mx)];
}
export const haversine = (a: [number, number], b: [number, number]) => {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
