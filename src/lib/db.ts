import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("fitfaaz.db");

db.execSync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT);
CREATE TABLE IF NOT EXISTS walks (
  id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, start TEXT, secs REAL, m REAL, steps REAL, kcal REAL, route TEXT
);
CREATE TABLE IF NOT EXISTS food (
  id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, time TEXT, meal TEXT, entry TEXT, kcal REAL, src TEXT
);
CREATE TABLE IF NOT EXISTS custom_foods (
  name TEXT PRIMARY KEY NOT NULL, kcal_serving REAL, kcal100 REAL, serving_g REAL, src TEXT
);
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, time TEXT, name TEXT, sets INTEGER, reps INTEGER, dur REAL, kg REAL
);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, secs REAL);
CREATE TABLE IF NOT EXISTS plan (
  id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, name TEXT, sets INTEGER, reps INTEGER, dur REAL, kg REAL
);
CREATE TABLE IF NOT EXISTS rest_days (date TEXT PRIMARY KEY NOT NULL);
CREATE TABLE IF NOT EXISTS walk_points (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, seg INTEGER, lat REAL, lng REAL, acc REAL, t REAL
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, met REAL NOT NULL, builtin INTEGER DEFAULT 0, sort INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS exercise_meta (
  key TEXT PRIMARY KEY NOT NULL, name TEXT, cat TEXT, rest_secs REAL
);
CREATE INDEX IF NOT EXISTS idx_food_date ON food(date);
CREATE INDEX IF NOT EXISTS idx_walks_date ON walks(date);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_plan_date ON plan(date);
`);

/** Add columns that newer versions need, keeping existing data. */
function addColumns(table: string, cols: Record<string, string>) {
  const have = new Set(db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`).map((c) => c.name));
  for (const [name, type] of Object.entries(cols)) {
    if (!have.has(name)) db.execSync(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
  }
}
addColumns("food", { grams: "REAL", p: "REAL", c: "REAL", f: "REAL", fib: "REAL", est: "INTEGER DEFAULT 0" });
addColumns("custom_foods", { p: "REAL", c: "REAL", f: "REAL", fib: "REAL", barcode: "TEXT" });
addColumns("workouts", { active: "REAL", rest: "REAL", session_id: "TEXT" });
addColumns("sessions", { active: "REAL", rest: "REAL", start_ts: "REAL", end_ts: "REAL" });

const BUILTIN_CATS: [string, string, number, number][] = [
  ["calisthenics", "Calisthenics", 6, 1],
  ["weights", "Weight training", 5, 2],
  ["stretches", "Stretches", 2.3, 3],
  ["cardio", "Cardio", 8, 4],
];
for (const [id, name, met, sort] of BUILTIN_CATS) {
  db.runSync("INSERT OR IGNORE INTO categories (id, name, met, builtin, sort) VALUES (?, ?, ?, 1, ?)", id, name, met, sort);
}

export function getSetting<T>(key: string, fallback: T): T {
  const row = db.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  if (!row || row.value == null) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}
export function setSetting(key: string, value: unknown) {
  if (value === null || value === undefined) db.runSync("DELETE FROM settings WHERE key = ?", key);
  else db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", key, JSON.stringify(value));
}
