import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Btn, Del, Empty, GroupHead, Note, Panel, Row, T, useToast } from "../../components/ui";
import { activeSecs, dayWorkout } from "../../lib/burn";
import { categoryOf, exKey } from "../../lib/categories";
import type { Workout } from "../../lib/types";
import { fmtDur, n0 } from "../../lib/util";
import { woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import Session, { SessionResult, SummarySheet } from "./Session";
import { CategoryPicker, ExerciseInput, useCatName, useKnownNames } from "./shared";

export default function Log() {
  const st = useStore(), toast = useToast();
  const [summary, setSummary] = useState<SessionResult | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const catName = useCatName();
  const known = useKnownNames();

  if (st.live) return (
    <>
      <Session onFinished={setSummary} />
      <SummarySheet data={summary} onClose={() => setSummary(null)} />
    </>
  );

  const items = st.workouts.filter((w) => w.date === st.todayISO);
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
        <Btn label="Start workout" onPress={() => st.startSession()} />
      </Panel>
      <View style={{ marginTop: 14 }}>
        <ExerciseInput placeholder="pushups 3x15, plank 60s, curls 3x10 8kg" button="Log" hint="Add reps or time, like pushups 3x15 or plank 60s"
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
          sub={`${fmtDur(s.secs)} · exercise ${fmtDur(s.active ?? 0)} · rest ${fmtDur(s.rest ?? Math.max(0, s.secs - (s.active ?? 0)))}`} />
      ))}
      {items.length ? catOrder.map((c) => (
        <View key={c}>
          <T w="semibold" size={13} c={C.leaf} style={{ marginTop: 10, marginBottom: 6, marginHorizontal: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{catName(c === "other" ? null : c)}</T>
          {byCat.get(c)!.map((w) => (
            <Row key={w.id} title={w.name} onLongPress={() => setMoving(w.name)}
              sub={`${w.time}${w.active != null ? ` · ${fmtDur(w.active)}` : ` · ~${fmtDur(activeSecs(w))}`}${w.rest ? ` · rest ${fmtDur(w.rest)}` : ""}`}
              right={<><T w="semibold">{woDesc(w).join(" · ")}</T><Del label={`Remove ${w.name}`} onPress={() => { st.delWorkout(w.id); toast("Removed"); }} /></>} />
          ))}
        </View>
      )) : <Empty>Nothing yet. Start a workout, or log an exercise above.</Empty>}
      {items.length && day.estimated ? <Note>Times marked ~ are estimated from your sets (about 1.5 minutes per set with rest). Use Start workout for exact times.</Note> : null}
      {items.length ? <Note style={{ marginTop: 4 }}>Long-press an exercise to change its category.</Note> : null}
      <SummarySheet data={summary} onClose={() => setSummary(null)} />
      <CategoryPicker name={moving} onClose={() => setMoving(null)} />
    </View>
  );
}
