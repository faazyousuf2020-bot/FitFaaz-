import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { BarChart, Legend, LineChart } from "../../components/charts";
import { Chips, Empty, Grid, Panel, T, Tile, Verdict } from "../../components/ui";
import { activeSecs, dayWorkout } from "../../lib/burn";
import { categoryOf, exKey } from "../../lib/categories";
import { addDays, cap1, dayISO, dMed, dShort, fmtDur, linReg, pct, sum, weekStart } from "../../lib/util";
import { exMetric, exTrend, woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import { CategoryPicker, useCatName } from "./shared";

export default function Progress() {
  const st = useStore();
  const catName = useCatName();
  const [cat, setCat] = useState("all");
  const [ex, setEx] = useState<string | null>(null);
  const [range, setRange] = useState(30);
  const [cap, setCap] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const from = dayISO(range - 1), TODAY = st.todayISO;

  // exercises grouped by category
  const names = useMemo(() => [...new Map(st.workouts.map((w) => [exKey(w.name), w])).values()], [st.workouts]);
  const catOfName = (n: string, kg = 0) => categoryOf(n, st.meta, kg) ?? "other";
  const catsWithData = [...st.categories.map((c) => c.id), "other"].filter((c) => names.some((w) => catOfName(w.name, w.kg) === c));
  const exInCat = names.filter((w) => catOfName(w.name, w.kg) === cat).map((w) => w.name);

  const pickCat = (c: string) => { setCat(c); setEx(null); setCap(null); };

  // weekly numbers for the chosen range
  const weeks: string[] = [];
  for (let ws = weekStart(from); ws <= TODAY; ws = addDays(ws, 7)) weeks.push(ws);
  const thisWs = weekStart(TODAY);
  const weekDays = (w: string) => [...Array(7)].map((_, i) => addDays(w, i)).filter((d) => d <= TODAY);
  const perWeek = weeks.map((w) => {
    const ds = weekDays(w).map((d) => dayWorkout(d, st.workouts, st.sessions, st.categories, st.meta, st.profile.weight));
    return {
      active: sum(ds, (d) => d.active) / 60, rest: sum(ds, (d) => d.rest) / 60, kcal: sum(ds, (d) => d.kcal),
      cat: (c: string) => sum(ds, (d) => d.byCat[c] ?? 0) / 60, days: ds.filter((d) => d.secs > 0).length,
    };
  });

  let body: React.ReactNode;
  if (!st.workouts.length && !st.sessions.length) body = <Empty>Log a few workouts to see your progress here.</Empty>;
  else if (cat === "all") {
    const totals = perWeek.map((w) => w.active + w.rest);
    const full = totals.slice(0, -1);
    const first = full.findIndex((v) => v > 0);
    const ch = first >= 0 && full.length - first >= 2 ? pct(full[full.length - 1], full[first]) : null;
    body = (
      <>
        <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 8 }}>
            <T w="semibold">Workout minutes per week</T><T c={C.muted} size={13}>{weeks.length} weeks</T>
          </View>
          <BarChart values={perWeek.map((w) => w.active)} stack={perWeek.map((w) => w.rest)} stackColor={C.turmeric}
            labels={weeks.map(dShort)} colors={weeks.map(() => C.leaf)} faded={weeks.map((w, i) => (w === thisWs ? i : -1)).filter((i) => i >= 0)}
            fmt={(v) => `${Math.round(v)}`}
            onTap={(i) => setCap(`Week of ${dShort(weeks[i])} · exercise ${Math.round(perWeek[i].active)} min · rest ${Math.round(perWeek[i].rest)} min · ~${Math.round(perWeek[i].kcal)} kcal · ${perWeek[i].days} day${perWeek[i].days === 1 ? "" : "s"}${weeks[i] === thisWs ? " (this week, still going)" : ""}`)} />
          <Legend items={[[C.leaf, "Exercise"], [C.turmeric, "Rest"]]} />
          <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that week. Untimed sets are estimated."}</T>
        </Panel>
        <Verdict tone={ch == null ? "flat" : ch > 5 ? "up" : ch < -5 ? "down" : "flat"}>
          {ch != null ? `Workout time is ${ch > 0 ? "up" : ch < 0 ? "down" : "flat"} ${Math.abs(ch)}% from your first full week to the last.` : "Log a couple of full weeks to see a trend."}
        </Verdict>
        <Grid>
          {catsWithData.map((c) => {
            const mins = sum(perWeek, (w) => w.cat(c));
            return <Tile key={c} k={catName(c === "other" ? null : c)} v={Math.round(mins)} unit="min exercise" onPress={() => pickCat(c)} />;
          })}
        </Grid>
      </>
    );
  } else if (!ex) {
    const vals = perWeek.map((w) => w.cat(cat));
    const trends = exInCat.map((n) => ({ n, t: exTrend(st.workouts, n, from) }));
    body = (
      <>
        <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 8 }}>
            <T w="semibold">{catName(cat === "other" ? null : cat)} · exercise minutes</T><T c={C.muted} size={13}>per week</T>
          </View>
          <BarChart values={vals} labels={weeks.map(dShort)} colors={weeks.map((w) => (w === thisWs ? C.turmeric : C.leaf))} fmt={(v) => `${Math.round(v)}`}
            onTap={(i) => setCap(`Week of ${dShort(weeks[i])} · ${Math.round(vals[i])} min of ${catName(cat === "other" ? null : cat).toLowerCase()}`)} />
          <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that week."}</T>
        </Panel>
        <Grid>
          {trends.map(({ n, t }) => (
            <Tile key={n} k={cap1(n)} onPress={() => { setEx(n); setCap(null); }}
              v={t ? `${t.pct > 0 ? "+" : ""}${t.pct}%` : "–"} vColor={t ? (t.pct > 5 ? C.leaf : t.pct < -5 ? C.danger : undefined) : undefined}
              sub={t ? (t.pct > 5 ? "Growing" : t.pct < -5 ? "Declining" : "Steady") : "Needs 2+ days"} />
          ))}
        </Grid>
      </>
    );
  } else {
    const rows = st.workouts.filter((w) => exKey(w.name) === exKey(ex) && w.date >= from);
    const byDay = [...new Set(rows.map((r) => r.date))].sort();
    const M = exMetric(rows);
    const vals = byDay.map((d) => sum(rows.filter((r) => r.date === d), M.get));
    const t = exTrend(st.workouts, ex, from);
    const timedRows = rows.filter((r) => r.active != null);
    const restRows = rows.filter((r) => r.rest);
    body = !vals.length ? <Empty>No sessions in this range.</Empty> : (
      <>
        <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 8 }}>
            <T w="semibold">{M.label}</T><T c={C.muted} size={13}>{byDay.length} days</T>
          </View>
          <LineChart values={vals} labels={byDay.map(dShort)} fmt={M.fmt} trend={linReg(vals)}
            onTap={(i) => setCap(`${dMed(byDay[i])} · ${M.show(vals[i])} · ${rows.filter((r) => r.date === byDay[i]).map((r) => woDesc(r).join(" ")).join(", ")}`)} />
          <Legend items={[[C.leaf, "Each day"], [C.turmeric, "Trend", true]]} />
          <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a point for that day."}</T>
        </Panel>
        {t ? (
          <Verdict tone={t.recentDrop || t.pct < -5 ? "down" : t.pct > 5 ? "up" : "flat"}>
            {t.recentDrop
              ? `${cap1(ex)} is ${t.pct > 0 ? "up" : "down"} ${Math.abs(t.pct)}% overall, but your last ${t.k} days average ${M.show(t.lastAvg)}, below your best of ${M.show(t.best)}. It may be worth an easier week or checking sleep and food.`
              : `${cap1(ex)} is ${t.pct > 5 ? "growing" : t.pct < -5 ? "declining" : "steady"}: ${t.pct > 0 ? "+" : ""}${t.pct}% from your first ${t.k} days to your last ${t.k} in this range.`}
          </Verdict>
        ) : <Verdict tone="flat">Log this exercise on another day to see a trend.</Verdict>}
        <Grid>
          {t ? <Tile k="Recent days" v={M.show(t.lastAvg)} /> : null}
          {t ? <Tile k="Best day" v={M.show(t.best)} /> : null}
          <Tile k="Time per set" v={timedRows.length ? fmtDur(sum(timedRows, (r) => activeSecs(r)) / timedRows.length) : "–"} sub={timedRows.length ? `${timedRows.length} timed sets` : "Use the workout timer"} />
          <Tile k="Rest between sets" v={restRows.length ? fmtDur(sum(restRows, (r) => r.rest ?? 0) / restRows.length) : "–"} sub="average" />
        </Grid>
      </>
    );
  }

  return (
    <View>
      <Chips options={[["all", "All"], ...catsWithData.map((c) => [c, catName(c === "other" ? null : c)] as [string, string])]} value={cat} onPick={pickCat} />
      {cat !== "all" && exInCat.length ? (
        <Chips options={[["", `All ${catName(cat === "other" ? null : cat).toLowerCase()}`], ...exInCat.map((n) => [n, cap1(n)] as [string, string])]}
          value={ex ?? ""} onPick={(v) => { setEx(v || null); setCap(null); }} />
      ) : null}
      <Chips options={[[14, "2 weeks"], [30, "30 days"], [90, "90 days"]]} value={range} onPick={(v) => { setRange(v); setCap(null); }} />
      {body}
      {ex ? (
        <Pressable onPress={() => setMoving(ex)} style={{ marginTop: 12, marginHorizontal: 4 }}>
          <T c={C.leaf} w="semibold" size={13}>Move "{ex}" to another category</T>
        </Pressable>
      ) : null}
      <CategoryPicker name={moving} onClose={() => setMoving(null)} />
    </View>
  );
}
