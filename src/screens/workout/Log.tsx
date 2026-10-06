import React, { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Btn, Del, Empty, GroupHead, Note, Panel, Row, Sheet, T, useToast } from "../../components/ui";
import { activeSecs, dayWorkout, sessionTotals } from "../../lib/burn";
import { categoryOf, exKey } from "../../lib/categories";
import type { Workout } from "../../lib/types";
import { dMed, fmtDur, n0, sum } from "../../lib/util";
import { isWalk, setText, setsRepsText, woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import { usePlanStatus } from "../PlanRows";
import Session, { SessionResult, SessionSummaryRows, SummarySheet } from "./Session";
import { CategoryPicker, ExerciseInput, useCatName, useKnownNames } from "./shared";

export default function Log() {
  const st = useStore(), toast = useToast();
  const [summary, setSummary] = useState<SessionResult | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const catName = useCatName();
  const known = useKnownNames();
  const status = usePlanStatus();

  if (st.live) return (
    <>
      <Session onFinished={setSummary} />
      <SummarySheet data={summary} onClose={() => setSummary(null)} />
    </>
  );

  const items = st.workouts.filter((w) => w.date === st.todayISO);
  const planToday = st.plan.filter((p) => p.date === st.todayISO && !isWalk(p.name));
  const pastDays = [...new Set(st.workouts.map((w) => w.date))].filter((d) => d < st.todayISO).sort().reverse().slice(0, 14);
  const firstUp = planToday.find((p) => status(st.todayISO, p) !== "done");
  const day = dayWorkout(st.todayISO, st.workouts, st.sessions, st.categories, st.meta, st.profile.weight);
  const sessions = st.sessions.filter((s) => s.date === st.todayISO);

  // today's rows grouped by category
  const byCat = new Map<string, Workout[]>();
  for (const w of items) {
    const c = categoryOf(w.name, st.meta, w.kg) ?? "other";
    byCat.set(c, [...(byCat.get(c) ?? []), w]);
  }
  const catOrder = [...st.categories.map((c) => c.id), "other"].filter((c) => byCat.has(c));

  return (
    <View>
      <Panel style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <T c={C.muted} size={14}>No workout running</T>
          <T size={13} c={C.muted} style={{ marginTop: 2 }}>Start one to time each set and your rest</T>
        </View>
        <Btn label="Start workout" onPress={() => st.startSession(firstUp?.name ?? null)} />
      </Panel>

      {planToday.length ? (
        <View style={{ marginTop: 16 }}>
          <GroupHead left="Today's plan" right={`${planToday.filter((p) => status(st.todayISO, p) === "done").length} of ${planToday.length} done`} style={{ marginTop: 0 }} />
          {planToday.map((p) => {
            const done = status(st.todayISO, p) === "done";
            const secs = sum(items.filter((w) => exKey(w.name) === exKey(p.name) && w.active != null), (w) => w.active ?? 0);
            return (
              <Row key={p.id} title={p.name}
                sub={`${setsRepsText(p)}${done ? " · Done" : ""}${secs ? ` · ${fmtDur(secs)}` : ""}`}
                left={
                  <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center",
                    backgroundColor: done ? C.leaf : "transparent", borderWidth: done ? 0 : 1.5, borderColor: C.line }}>
                    <T w="bold" size={12}>{done ? "✓" : ""}</T>
                  </View>
                }
                right={done ? undefined : <Btn small label="Start" onPress={() => st.startSession(p.name)} />} />
            );
          })}
          <Note style={{ marginTop: 4 }}>Start times each set and the rest between sets. You can also log without the timer below.</Note>
        </View>
      ) : null}
      <View style={{ marginTop: 14 }}>
        <T w="semibold" size={15} style={{ marginHorizontal: 4, marginBottom: 6 }}>Log without the timer</T>
        <ExerciseInput button="Log"
          onAdd={(e) => { st.addWorkout(e); toast(`Logged ${e.name}`); }} />
      </View>
      {!items.length && known.length ? (
        <View>
          <T c={C.muted} size={13} style={{ marginHorizontal: 4, marginBottom: 6 }}>Log again</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {known.slice(0, 8).map((n) => {
              const last = [...st.workouts].reverse().find((w) => exKey(w.name) === exKey(n));
              if (!last) return null;
              const e = { name: last.name, sets: last.active != null && last.reps ? 1 : last.sets, reps: last.reps, dur: last.dur, kg: last.kg };
              return (
                <Pressable key={n} onPress={() => { st.addWorkout(e); toast(`Logged ${n} · ${woDesc(e).join(" ")}`); }}
                  style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface }}>
                  <T size={14}>{n} {woDesc(e).join(" ")}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <GroupHead left="Today" right={items.length || sessions.length ? `${fmtDur(day.secs)} · ~${n0(day.kcal)} kcal` : undefined} style={{ marginTop: 18 }} />
      {sessions.map((s) => (
        <Row key={s.id} title={`Workout ${s.start_ts ? new Date(s.start_ts).toTimeString().slice(0, 5) : ""}`}
          sub={`exercise ${fmtDur(s.active ?? 0)} · rest ${fmtDur(s.rest ?? 0)} · tap to see or delete`}
          onPress={() => setOpenSession(s.id)} />
      ))}
      {items.length ? catOrder.map((c) => (
        <View key={c}>
          <T w="semibold" size={13} c={C.tealText} style={{ marginTop: 10, marginBottom: 6, marginHorizontal: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{catName(c === "other" ? null : c)}</T>
          {[...new Map(byCat.get(c)!.map((w) => [exKey(w.name), w.name])).entries()].map(([k, name]) => {
            const ws = byCat.get(c)!.filter((w) => exKey(w.name) === k);
            const nSets = sum(ws, (w) => Math.max(1, w.sets || 1));
            const totalReps = sum(ws, (w) => Math.max(1, w.sets || 1) * (w.reps || 0));
            const secs = sum(ws, (w) => activeSecs(w)), rst = sum(ws, (w) => (w.active != null ? w.rest ?? 0 : 0));
            let n = 0;
            return (
              <View key={k} style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12, marginBottom: 8 }}>
                <Pressable onLongPress={() => setMoving(name)} style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
                  <T w="bold" size={17}>{name}</T>
                  <T w="semibold" c={C.tealText}>{nSets} set{nSets === 1 ? "" : "s"}{totalReps ? ` · ${totalReps} reps` : ""}</T>
                </Pressable>
                <T c={C.muted} size={13} style={{ marginTop: 2 }}>
                  {ws.some((w) => w.active != null) ? "" : "~"}{fmtDur(secs)} exercise{rst ? ` · rest ${fmtDur(rst)}` : ""}
                </T>
                {ws.map((w) => {
                  const from = n + 1; n += Math.max(1, w.sets || 1);
                  const label = w.sets > 1 ? `Sets ${from}–${n}` : `Set ${from}`;
                  return (
                    <View key={w.id} style={{ flexDirection: "row", alignItems: "center", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line }}>
                      <T size={14} c={C.muted} style={{ width: 86 }}>{label}</T>
                      <T size={15} w="semibold" style={{ flex: 1 }}>{w.sets > 1 ? `${w.sets} × ${setText(w)}` : setText(w)}</T>
                      <T size={13} c={C.muted} style={{ marginRight: 6 }}>{w.time}</T>
                      <Del label={`Remove ${label} of ${name}`} onPress={() => { st.delWorkout(w.id); toast("Removed"); }} />
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      )) : <Empty>Nothing yet. Start a workout, or log an exercise above.</Empty>}
      {items.length && day.estimated ? <Note>Times marked ~ are estimated from your sets (about 3 seconds a rep and 1 minute of rest between sets). Use Start workout for exact times.</Note> : null}
      {items.length ? <Note style={{ marginTop: 4 }}>Long-press an exercise name to change its category.</Note> : null}
      {items.length || sessions.length ? (
        <Btn kind="stop" small label="Delete today's workouts" style={{ alignSelf: "flex-start", marginTop: 14 }} onPress={() =>
          Alert.alert("Delete today's workouts?", "Every exercise and workout logged today will be deleted. Your plan stays.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => { st.clearWorkoutDay(st.todayISO); toast("Today's workouts deleted"); } },
          ])} />
      ) : null}
      {pastDays.length ? (
        <View style={{ marginTop: 22 }}>
          <GroupHead left="Earlier days" style={{ marginTop: 0 }} />
          {pastDays.map((d) => {
            const dw = dayWorkout(d, st.workouts, st.sessions, st.categories, st.meta, st.profile.weight);
            const n = new Set(st.workouts.filter((w) => w.date === d).map((w) => exKey(w.name))).size;
            return (
              <Row key={d} title={dMed(d)} sub={`${n} exercise${n === 1 ? "" : "s"} · ${fmtDur(dw.secs)} · ~${n0(dw.kcal)} kcal`}
                right={<Del label={`Delete workouts on ${dMed(d)}`} onPress={() =>
                  Alert.alert(`Delete workouts on ${dMed(d)}?`, "Every exercise and workout logged that day will be deleted.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => { st.clearWorkoutDay(d); toast("Deleted"); } },
                  ])} />} />
            );
          })}
        </View>
      ) : null}
      <SessionSheet id={openSession} onClose={() => setOpenSession(null)} />
      <SummarySheet data={summary} onClose={() => setSummary(null)} />
      <CategoryPicker name={moving} onClose={() => setMoving(null)} />
    </View>
  );
}

/** A finished workout: its sets, totals, and a delete button. */
function SessionSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const st = useStore(), toast = useToast();
  const s = id ? st.sessions.find((x) => x.id === id) : null;
  const rows = id ? st.workouts.filter((w) => w.session_id === id) : [];
  const t = sessionTotals(rows, st.categories, st.meta, st.profile.weight);
  return (
    <Sheet visible={!!s} onClose={onClose}>
      {s ? (
        <View>
          <T w="bold" size={20}>Workout {s.start_ts ? new Date(s.start_ts).toTimeString().slice(0, 5) : ""}</T>
          <T size={15} style={{ marginTop: 6 }}>exercise {fmtDur(t.active)} · rest {fmtDur(t.rest)} · about {n0(t.kcal)} kcal</T>
          <View style={{ marginTop: 12 }}>{rows.length ? <SessionSummaryRows rows={rows} /> : <Empty>No sets in this workout.</Empty>}</View>
          <Btn kind="stop" label="Delete this workout" style={{ marginTop: 14 }} onPress={() =>
            Alert.alert("Delete this workout?", "Its sets will be deleted too.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => { st.delSession(s.id); toast("Workout deleted"); onClose(); } },
            ])} />
        </View>
      ) : null}
    </Sheet>
  );
}
