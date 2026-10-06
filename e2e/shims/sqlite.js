// expo-sqlite stand-in backed by sql.js (in memory). globalThis.__SQL is set by e2e/entry.js before the app loads.
function bind(params) { return params.length === 1 && params[0] && typeof params[0] === "object" && !Array.isArray(params[0]) ? params[0] : params.map((v) => (v === undefined ? null : v)); }
function rows(db, sql, params) {
  const st = db.prepare(sql); const out = [];
  try { st.bind(bind(params)); while (st.step()) out.push(st.getAsObject()); } finally { st.free(); }
  return out;
}
export function openDatabaseSync() {
  const db = new globalThis.__SQL.Database();
  return {
    execSync: (sql) => db.exec(sql),
    runSync: (sql, ...params) => { const st = db.prepare(sql); st.run(bind(params)); st.free(); return { changes: db.getRowsModified(), lastInsertRowId: 0 }; },
    getAllSync: (sql, ...params) => rows(db, sql, params),
    getFirstSync: (sql, ...params) => rows(db, sql, params)[0] ?? null,
    withTransactionSync: (fn) => { db.exec("BEGIN"); try { fn(); db.exec("COMMIT"); } catch (e) { db.exec("ROLLBACK"); throw e; } },
  };
}
