import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { db } from "./db";
import { today } from "./util";

const DATA_TABLES = ["walks", "food", "custom_foods", "workouts", "sessions", "plan", "rest_days"] as const;
const KEEP_SETTINGS = ["profile", "reminders"];

export async function exportBackup() {
  const out: Record<string, unknown> = { app: "FitFaaz", version: 1, exportedAt: new Date().toISOString() };
  for (const t of DATA_TABLES) out[t] = db.getAllSync(`SELECT * FROM ${t}`);
  out.settings = db.getAllSync(`SELECT * FROM settings WHERE key IN (${KEEP_SETTINGS.map(() => "?").join(",")})`, ...KEEP_SETTINGS);
  const file = new File(Paths.cache, `fitfaaz-backup-${today()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(out));
  await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "Save FitFaaz backup" });
}

/** Pick a backup file and replace all data with it. Returns a message. */
export async function importBackup(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ["application/json", "*/*"], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.length) return null;
  const text = await new File(res.assets[0].uri).text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error("That file isn't a FitFaaz backup."); }
  if (data?.app !== "FitFaaz") throw new Error("That file isn't a FitFaaz backup.");
  db.withTransactionSync(() => {
    for (const t of [...DATA_TABLES, "settings"]) {
      const rows: Record<string, unknown>[] = Array.isArray(data[t]) ? data[t] : [];
      if (t === "settings") db.runSync(`DELETE FROM settings WHERE key IN (${KEEP_SETTINGS.map(() => "?").join(",")})`, ...KEEP_SETTINGS);
      else db.runSync(`DELETE FROM ${t}`);
      const allowed = new Set(db.getAllSync<{ name: string }>(`PRAGMA table_info(${t})`).map((c) => c.name));
      for (const r of rows) {
        if (!r || typeof r !== "object") continue;
        const cols = Object.keys(r).filter((c) => allowed.has(c));
        if (!cols.length) continue;
        db.runSync(
          `INSERT OR REPLACE INTO ${t} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
          ...cols.map((c) => r[c] as any),
        );
      }
    }
  });
  const n = (data.walks?.length ?? 0) + (data.food?.length ?? 0) + (data.workouts?.length ?? 0);
  return `Restored ${n} entries`;
}

export function wipeAll() {
  db.withTransactionSync(() => {
    for (const t of DATA_TABLES) db.runSync(`DELETE FROM ${t}`);
  });
}
