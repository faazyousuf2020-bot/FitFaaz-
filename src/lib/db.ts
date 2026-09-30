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
CREATE INDEX IF NOT EXISTS idx_food_date ON food(date);
CREATE INDEX IF NOT EXISTS idx_walks_date ON walks(date);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_plan_date ON plan(date);
`);

export function getSetting<T>(key: string, fallback: T): T {
  const row = db.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  if (!row || row.value == null) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}
export function setSetting(key: string, value: unknown) {
  if (value === null || value === undefined) db.runSync("DELETE FROM settings WHERE key = ?", key);
  else db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", key, JSON.stringify(value));
}

export const TABLES = ["walks", "food", "custom_foods", "workouts", "sessions", "plan", "rest_days", "settings"] as const;
