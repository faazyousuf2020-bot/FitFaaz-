import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { BarChart, Legend, LineChart } from "../components/charts";
import { Btn, Chips, Del, Empty, Field, Grid, GroupHead, Meter, Panel, Rest, Row, Seg, T, Tile, Verdict, useToast } from "../components/ui";
import type { Exercise } from "../lib/types";
import {
  addDays, cap1, dLong, dMed, dNum, dShort, dWd, dWdLong, dayISO, fmtClock, fmtDur, linReg, n0, pct, sum, weekStart,
} from "../lib/util";
import { exKey, exMetric, exTrend, parseWo, validEx, woDesc } from "../lib/workout";
import { useStore } from "../store";
import { C } from "../theme";
import { PlanRow, usePlanStatus } from "./PlanRows";

export default function Workout({ pane, setPane, go }: { pane: string; setPane: (p: string) => void; go: (t: string, p?: string) => void }) {
  return (
    <View>
      <Seg options={[["log", "Log"], ["progress", "Progress"], ["plan", "Plan"]]} value={pane} onPick={setPane} />
      {pane === "log" ? <Log /> : pane === "progress" ? <Progress /> : <Plan go={go} />}
    </View>
  );
}

const Tags = ({ p }: { p: Exercise }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
    {[p.name, ...woDesc(p), ...(p.sets > 1 ? [`${p.sets * p.reps} total`] : [])].map((t, i) => (
      <View key={i} style={{ backgroundColor: C.leafSoft, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 8 }}>
        <T w="semibold" size={13} c={C.leaf}>{t}</T>
      </View>
    ))}
  </View>
);

function useKnownNames() {
  const st = useStore();
  return useMemo(() => [...new Map([...st.workouts, ...st.plan].map((w) => [exKey(w.name), w.name])).values()], [st.workouts, st.plan]);
}

function ExerciseInput({ placeholder, button, onAdd, hint }: { placeholder: string; button: string; onAdd: (e: Exercise) => void; hint: string }) {
  const known = useKnownNames();
  const [text, setText] = useState("");
  const p = text.trim() ? parseWo(text, known) : null;
  const ok = !!p && validEx(p);
  const submit = () => { if (p && ok) { onAdd(p); setText(""); } };
  return (
    <View>
      <Field value={text} onChangeText={setText} placeholder={placeholder} button={button} disabled={!ok} onSubmit={submit}
        autoCorrect={false} autoCapitalize="none" />
      <View style={{ minHeight: 22, paddingTop: 8, paddingHorizontal: 6 }}>
        {p ? ok ? <Tags p={p} /> : <T c={C.muted} size={14}>{hint}</T> : null}
      </View>
    </View>
  );
}

function Log() {
  const st = useStore(), toast = useToast();
  const [, tick] = useState(0);
  useEffect(() => {
    if (!st.sessionStart) return;
    const h = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(h);
  }, [st.sessionStart]);
  const on = !!st.sessionStart;
  const items = st.workouts.filter((w) => w.date === st.todayISO);
  const known = useKnownNames();
  return (
    <View>
      <Panel style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <T c={C.muted} size={14}>{on ? "Workout running" : "No workout running"}</T>
          <T w="bold" size={32} style={{ letterSpacing: -1 }}>{fmtClock(on ? (Date.now() - st.sessionStart!) / 1000 : 0)}</T>
        </View>
        <Btn kind={on ? "stop" : "primary"} label={on ? "Stop" : "Start workout"} onPress={() => {
          if (on) { const s = st.stopSession(); toast(s > 10 ? `Workout done · ${fmtDur(s)}` : "Too short to save"); }
          else st.startSession();
        }} />
      </Panel>
      <View style={{ marginTop: 14 }}>
        <ExerciseInput placeholder="pushups 3x15, plank 60s, curls 3x10 8kg" button="Log" hint="Add reps or time, like pushups 3x15 or plank 60s"
          onAdd={(e) => { st.addWorkout(e); toast(`Logged ${e.name}`); }} />
      </View>
      {!items.length && known.length ? (
        <View>
          <T c={C.muted} size={13} style={{ marginHorizontal: 4, marginBottom: 6 }}>Your exercises</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {known.slice(0, 8).map((n) => {
              const last = [...st.workouts].reverse().find((w) => exKey(w.name) === exKey(n));
              if (!last) return null;
              return (
                <Pressable key={n} onPress={() => { st.addWorkout(last); toast(`Logged ${n} · ${woDesc(last).join(" ")}`); }}
                  style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface }}>
                  <T size={14}>{n} {woDesc(last).join(" ")}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      <GroupHead left="Today" right={items.length ? `${items.length} logged · ${sum(items, (w) => w.sets * w.reps)} reps` : undefined} style={{ marginTop: 18 }} />
      {items.length ? items.map((w) => (
        <Row key={w.id} title={w.name} sub={w.time}
          right={<><T w="semibold">{woDesc(w).join(" · ")}</T><Del label={`Remove ${w.name}`} onPress={() => { st.delWorkout(w.id); toast("Removed"); }} /></>} />
      )) : <Empty>Nothing yet. Start a workout, then log each exercise.</Empty>}
    </View>
  );
}

function Progress() {
  const st = useStore();
  const [ex, setEx] = useState("all");
  const [range, setRange] = useState(30);
  const [cap, setCap] = useState<string | null>(null);
  const names = useMemo(() => [...new Map(st.workouts.map((w) => [exKey(w.name), w.name])).values()], [st.workouts]);
  const from = dayISO(range - 1), TODAY = st.todayISO;
  const pickEx = (v: string) => { setEx(v); setCap(null); };

  let body: React.ReactNode;
  if (!st.workouts.length && !st.sessions.length) {
    body = <Empty>Log a few workouts to see your progress here.</Empty>;
  } else if (ex === "all") {
    const weeks: string[] = [];
    let ws = weekStart(from);
    while (ws <= TODAY) { weeks.push(ws); ws = addDays(ws, 7); }
    const inWeek = (w: string) => st.sessions.filter((s) => s.date >= w && s.date < addDays(w, 7));
    const mins = weeks.map((w) => sum(inWeek(w), (s) => s.secs) / 60);
    const cnt = weeks.map((w) => inWeek(w).length);
    const thisWs = weekStart(TODAY);
    const full = mins.slice(0, -1);
    const firstIdx = full.findIndex((v) => v > 0);
    const ch = firstIdx >= 0 && full.length - firstIdx >= 2 ? pct(full[full.length - 1], full[firstIdx]) : null;
    const perEx = names.map((n) => ({ n, t: exTrend(st.workouts, n, from) })).filter((x) => x.t);
    body = (
      <>
        <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 8 }}>
            <T w="semibold">Workout minutes per week</T><T c={C.muted} size={13}>{weeks.length} weeks</T>
          </View>
          <BarChart values={mins} labels={weeks.map(dShort)} colors={weeks.map((w) => (w === thisWs ? C.turmeric : C.leaf))}
            fmt={(v) => `${Math.round(v)}`}
            onTap={(i) => setCap(`Week of ${dShort(weeks[i])} · ${Math.round(mins[i])} min over ${cnt[i]} workout${cnt[i] === 1 ? "" : "s"}${weeks[i] === thisWs ? " (this week, still going)" : ""}`)} />
          <Legend items={[[C.leaf, "Full weeks"], [C.turmeric, "This week so far"]]} />
          <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that week. Minutes come from Start workout / Stop."}</T>
        </Panel>
        <Verdict tone={ch == null ? "flat" : ch > 5 ? "up" : ch < -5 ? "down" : "flat"}>
          {ch != null ? `Workout time is ${ch > 0 ? "up" : ch < 0 ? "down" : "flat"} ${Math.abs(ch)}% from your first full week to the last.` : "Log a couple of full weeks to see a trend."}
        </Verdict>
        <Grid>
          {perEx.map(({ n, t }) => (
            <Tile key={n} k={cap1(n)} v={`${t!.pct > 0 ? "+" : ""}${t!.pct}%`} vColor={t!.pct > 5 ? C.leaf : t!.pct < -5 ? C.danger : undefined}
              sub={t!.pct > 5 ? "Growing" : t!.pct < -5 ? "Declining" : "Steady"} onPress={() => pickEx(n)} />
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
    body = !vals.length ? <Empty>No sessions in this range.</Empty> : (
      <>
        <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 8 }}>
            <T w="semibold">{M.label}</T><T c={C.muted} size={13}>{byDay.length} sessions</T>
          </View>
          <LineChart values={vals} labels={byDay.map(dShort)} fmt={M.fmt} trend={linReg(vals)}
            onTap={(i) => setCap(`${dMed(byDay[i])} · ${M.show(vals[i])} · ${rows.filter((r) => r.date === byDay[i]).map((r) => woDesc(r).join(" ")).join(", ")}`)} />
          <Legend items={[[C.leaf, "Each session"], [C.turmeric, "Trend", true]]} />
          <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a point for that session."}</T>
        </Panel>
        {t ? (
          <>
            <Verdict tone={t.recentDrop || t.pct < -5 ? "down" : t.pct > 5 ? "up" : "flat"}>
              {t.recentDrop
                ? `${cap1(ex)} is ${t.pct > 0 ? "up" : "down"} ${Math.abs(t.pct)}% overall, but your last ${t.k} sessions average ${M.show(t.lastAvg)}, below your best of ${M.show(t.best)}. It may be worth an easier week or checking sleep and food.`
                : `${cap1(ex)} is ${t.pct > 5 ? "growing" : t.pct < -5 ? "declining" : "steady"}: ${t.pct > 0 ? "+" : ""}${t.pct}% from your first ${t.k} sessions to your last ${t.k} in this range.`}
            </Verdict>
            <Grid>
              <Tile k="First sessions" v={M.show(t.firstAvg)} />
              <Tile k="Recent sessions" v={M.show(t.lastAvg)} />
              <Tile k="Best session" v={M.show(t.best)} />
              <Tile k="Sessions" v={vals.length} />
            </Grid>
          </>
        ) : <Verdict tone="flat">Log this exercise on another day to see a trend.</Verdict>}
      </>
    );
  }

  return (
    <View>
      <Chips options={[["all", "All workouts"], ...names.map((n) => [n, cap1(n)] as [string, string])]} value={ex} onPick={pickEx} />
      <Chips options={[[14, "2 weeks"], [30, "30 days"], [90, "90 days"]]} value={range} onPick={(v) => { setRange(v); setCap(null); }} />
      {body}
    </View>
  );
}

function Plan({ go }: { go: (t: string, p?: string) => void }) {
  const st = useStore(), toast = useToast(), status = usePlanStatus();
  const TODAY = st.todayISO, thisWs = weekStart(TODAY);
  const [ws, setWs] = useState(thisWs);
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const [day, setDay] = useState(TODAY);
  const planDay = days.includes(day) ? day : days.includes(TODAY) ? TODAY : days[0];

  const all = days.flatMap((d) => st.plan.filter((p) => p.date === d).map((it) => status(d, it)));
  const done = all.filter((s) => s === "done").length;
  const title = ws === thisWs ? "This week" : ws === addDays(thisWs, 7) ? "Next week" : ws < thisWs ? "Past week" : "Upcoming week";
  const PIP = { done: C.leaf, miss: C.danger, part: C.turmeric, todo: C.line };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Pressable onPress={() => setWs(addDays(ws, -7))} style={navBtn}><T size={20}>‹</T></Pressable>
        <View style={{ alignItems: "center" }}>
          <T w="semibold" size={16}>{title}</T>
          <T c={C.muted} size={13}>{dShort(days[0])} – {dShort(days[6])}</T>
        </View>
        <Pressable onPress={() => setWs(addDays(ws, 7))} style={navBtn}><T size={20}>›</T></Pressable>
      </View>
      <Panel style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <T size={14}>{all.length ? `${done} of ${all.length} planned done` : "Nothing planned yet"}</T>
          <T w="semibold" size={14}>{all.length ? `${Math.round((done / all.length) * 100)}%` : ""}</T>
        </View>
        <Meter frac={all.length ? done / all.length : 0} height={8} />
      </Panel>
      <View style={{ flexDirection: "row", gap: 4, marginVertical: 12 }}>
        {days.map((d) => {
          const on = d === planDay, rest = st.restDays.has(d);
          const pips = rest ? [] : st.plan.filter((p) => p.date === d).map((it) => status(d, it));
          return (
            <Pressable key={d} onPress={() => setDay(d)} style={{
              flex: 1, paddingTop: 8, paddingBottom: 7, borderRadius: 12, backgroundColor: C.surface, alignItems: "center", gap: 2,
              borderWidth: 1.5, borderColor: on ? C.ink : "transparent",
            }}>
              <T c={C.muted} size={12}>{dWd(d)}</T>
              <T w="semibold" size={16} c={d === TODAY ? C.leaf : C.ink}>{dNum(d)}</T>
              <View style={{ flexDirection: "row", gap: 2, height: 5 }}>
                {pips.slice(0, 5).map((p, i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: PIP[p] }} />)}
              </View>
            </Pressable>
          );
        })}
      </View>
      <ExerciseInput placeholder={`Add to ${dWd(planDay)}: pushups 3x15, walk 30 min`} button="Add"
        hint="Add reps or time, like squats 3x20 or walk 30 min"
        onAdd={(e) => { st.addPlan(planDay, e); toast(`Added to ${dWdLong(planDay)}`); }} />
      <View style={{ flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 18 }}>
        <Btn small kind="ghost" label={st.restDays.has(planDay) ? "Not a rest day" : `Rest on ${dWd(planDay)}`} onPress={() => st.toggleRest(planDay)} />
        <Btn small kind="ghost" label="Copy to next week" onPress={() => {
          st.copyWeek(ws); setWs(addDays(ws, 7)); setDay(addDays(ws, 7)); toast("Copied to next week");
        }} />
      </View>
      {days.map((d) => {
        const list = st.plan.filter((p) => p.date === d);
        return (
          <View key={d} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 4, marginBottom: 6 }}>
              <T w="semibold" size={14}>{dLong(d)}</T>
              <T c={C.muted} size={13}>{d === TODAY ? "Today" : ""}</T>
            </View>
            {st.restDays.has(d) ? <Rest>Rest day</Rest>
              : list.length ? list.map((it) => <PlanRow key={it.id} item={it} withLog={false} onGoWalk={() => go("walk", "track")} />)
              : <Rest>Nothing planned</Rest>}
          </View>
        );
      })}
    </View>
  );
}

const navBtn = {
  width: 40, height: 40, borderRadius: 12, alignItems: "center" as const, justifyContent: "center" as const,
  backgroundColor: C.surface, borderWidth: 1, borderColor: C.line,
};
