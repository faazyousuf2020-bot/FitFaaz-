import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Vibration, View } from "react-native";
import { Btn, Chips, Empty, GroupHead, Note, Panel, Row, Sheet, SheetInput, SheetLabel, T, useToast } from "../../components/ui";
import { activeSecs, REST_MET } from "../../lib/burn";
import { categoryOf, exKey, metOf } from "../../lib/categories";
import { cancelRestAlert, scheduleRestAlert } from "../../lib/reminders";
import type { Workout } from "../../lib/types";
import { fmtClock, fmtDur, n0, sum } from "../../lib/util";
import { isWalk, woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import { ExerciseInput, useCatName, useKnownNames } from "./shared";

/** The Log tab while a workout is running: time each set and the rest between them. */
export type SessionResult = { secs: number; active: number; rest: number; kcal: number; rows: Workout[] };
export default function Session({ onFinished }: { onFinished: (r: SessionResult) => void }) {
  const st = useStore(), toast = useToast();
  const live = st.live!;
  const [now, setNow] = useState(Date.now());
  const [other, setOther] = useState(false);
  const [editSet, setEditSet] = useState<Workout | null>(null);
  const [restPick, setRestPick] = useState(false);
  const vibrated = useRef(false);
  const known = useKnownNames();
  const catName = useCatName();

  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(h);
  }, []);

  const rows = st.workouts.filter((w) => w.session_id === live.id);
  const setSecs = live.setStartedAt ? (now - live.setStartedAt) / 1000 : 0;
  const total = (now - live.startedAt) / 1000;
  const exercise = sum(rows, (w) => activeSecs(w)) + setSecs;
  const rest = Math.max(0, total - exercise);
  const restNow = !live.setStartedAt && live.lastSetEndedAt ? (now - live.lastSetEndedAt) / 1000 : 0;

  const cur = live.current;
  const restTarget = cur ? st.meta[exKey(cur)]?.rest_secs ?? st.restAlert.secs : st.restAlert.secs;
  // vibrate in the app when rest is over (the notification covers the phone being locked)
  useEffect(() => {
    if (!st.restAlert.on || !restNow) { vibrated.current = false; return; }
    if (restNow >= restTarget && !vibrated.current) {
      vibrated.current = true;
      Vibration.vibrate([0, 400, 200, 400]);
      cancelRestAlert();
    }
  }, [restNow >= restTarget, st.restAlert.on, live.lastSetEndedAt]);

  // what's planned for today, in order
  const planToday = st.plan.filter((p) => p.date === st.todayISO && !isWalk(p.name));
  const choices = useMemo(() => {
    const names = [...planToday.map((p) => p.name), ...known.filter((k) => !isWalk(k))];
    return [...new Map(names.map((n) => [exKey(n), n])).values()].slice(0, 10);
  }, [planToday.length, known.length]);
  const planned = cur ? planToday.find((p) => exKey(p.name) === exKey(cur)) : undefined;
  const curRows = cur ? rows.filter((w) => exKey(w.name) === exKey(cur)) : [];
  const lastEver = cur ? [...st.workouts].reverse().find((w) => exKey(w.name) === exKey(cur)) : undefined;
  const timed = planned ? !planned.reps && planned.dur > 0 : !!lastEver && !lastEver.reps && lastEver.dur > 0;
  const nextReps = curRows.length ? curRows[curRows.length - 1].reps : planned?.reps || lastEver?.reps || 10;
  const nextKg = curRows.length ? curRows[curRows.length - 1].kg : planned?.kg || lastEver?.kg || 0;

  const pick = (name: string) => { st.setLive({ current: name }); setOther(false); };
  const startSet = () => {
    if (!cur) return;
    cancelRestAlert();
    vibrated.current = false;
    st.setLive({ setStartedAt: Date.now() });
  };
  const doneSet = () => {
    if (!cur) return;
    st.endSet({ name: cur, sets: 1, reps: timed ? 0 : nextReps, dur: 0, kg: nextKg });
    if (st.restAlert.on) scheduleRestAlert(restTarget, cur);
  };
  const stop = () => Alert.alert("Finish workout?", `${fmtClock(total)} so far`, [
    { text: "Keep going", style: "cancel" },
    { text: "Finish", onPress: () => {
      cancelRestAlert();
      const res = st.stopSession();
      if (!res) { toast("Too short to save"); return; }
      const kg = st.profile.weight;
      const act = sum(res.rows, (w) => activeSecs(w));
      const kcal = sum(res.rows, (w) => (metOf(categoryOf(w.name, st.meta, w.kg), st.categories) * kg * activeSecs(w)) / 3600)
        + (REST_MET * kg * Math.max(0, res.secs - act)) / 3600;
      onFinished({ secs: res.secs, active: act, rest: Math.max(0, res.secs - act), kcal, rows: res.rows });
    } },
  ]);

  return (
    <View>
      <Panel>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <T c={C.muted} size={14}>Workout running</T>
            <T w="bold" size={34} style={{ letterSpacing: -1 }}>{fmtClock(total)}</T>
          </View>
          <Btn kind="stop" label="Finish" onPress={stop} />
        </View>
        <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
          <T size={14}><T w="semibold" size={14} c={C.leaf}>Exercise </T>{fmtClock(exercise)}</T>
          <T size={14}><T w="semibold" size={14} c={C.turmericInk}>Rest </T>{fmtClock(rest)}</T>
        </View>
      </Panel>

      <GroupHead left={cur ? "Doing now" : "Pick an exercise"} style={{ marginTop: 18 }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {choices.map((n) => {
          const on = cur && exKey(n) === exKey(cur);
          return (
            <Pressable key={n} onPress={() => pick(n)} disabled={!!live.setStartedAt}
              style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? C.ink : C.sunk, opacity: live.setStartedAt && !on ? 0.4 : 1 }}>
              <T size={14} c={on ? C.surface : C.ink}>{n}</T>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setOther(!other)} disabled={!!live.setStartedAt}
          style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line }}>
          <T size={14}>+ Other</T>
        </Pressable>
      </View>
      {other ? (
        <ExerciseInput placeholder="Exercise name, e.g. burpees" button="Pick" hint="Type a name, plus reps or time, like burpees 10"
          onAdd={(e) => pick(e.name)} />
      ) : null}

      {cur ? (
        <Panel style={{ alignItems: "center", paddingVertical: 22 }}>
          <T w="bold" size={22}>{cur}</T>
          <T c={C.muted} size={14} style={{ marginTop: 2 }}>
            {catName(categoryOf(cur, st.meta, nextKg))}{planned ? ` · plan ${woDesc(planned).join(" ")}` : ""} · set {curRows.length + 1}
            {planned?.sets ? ` of ${planned.sets}` : ""}
          </T>
          {live.setStartedAt ? (
            <>
              <T w="bold" size={56} c={C.leaf} style={{ letterSpacing: -2, marginTop: 10 }}>{fmtClock(setSecs)}</T>
              <T c={C.muted} size={14}>{timed ? `Holding${planned?.dur ? ` · target ${fmtDur(planned.dur)}` : ""}` : `Set in progress · ${nextReps} reps${nextKg ? ` · ${nextKg} kg` : ""}`}</T>
              <Pressable onPress={doneSet} style={{ marginTop: 16, width: 150, height: 150, borderRadius: 75, backgroundColor: C.leaf, alignItems: "center", justifyContent: "center" }}>
                <T w="bold" size={20} c="#fff">Set done</T>
              </Pressable>
              <Pressable onPress={() => st.setLive({ setStartedAt: null })} style={{ marginTop: 10 }}>
                <T c={C.muted} size={14}>Cancel this set</T>
              </Pressable>
            </>
          ) : (
            <>
              {live.lastSetEndedAt ? (
                <>
                  <T w="bold" size={56} c={st.restAlert.on && restNow >= restTarget ? C.danger : C.turmericInk} style={{ letterSpacing: -2, marginTop: 10 }}>{fmtClock(restNow)}</T>
                  <T c={C.muted} size={14}>Resting{st.restAlert.on ? ` · alert at ${fmtDur(restTarget)}` : ""}</T>
                </>
              ) : <T c={C.muted} size={14} style={{ marginTop: 10 }}>Tap when you begin the set</T>}
              <Pressable onPress={startSet} style={{ marginTop: 16, width: 150, height: 150, borderRadius: 75, backgroundColor: C.turmeric, alignItems: "center", justifyContent: "center" }}>
                <T w="bold" size={20} c={C.turmericInk}>Start set</T>
              </Pressable>
            </>
          )}
          {st.restAlert.on ? (
            <Pressable onPress={() => setRestPick(true)} style={{ marginTop: 12 }}>
              <T c={C.leaf} size={13} w="semibold">Rest alert for {cur}: {fmtDur(restTarget)} · change</T>
            </Pressable>
          ) : null}
        </Panel>
      ) : null}

      {curRows.length ? (
        <View style={{ marginTop: 12 }}>
          {curRows.map((w, i) => (
            <Row key={w.id} onPress={() => setEditSet(w)} title={`Set ${i + 1} · ${woDesc(w).join(" · ") || fmtDur(w.dur)}`}
              sub={`${w.active != null ? `took ${fmtDur(w.active)}` : "not timed"}${w.rest ? ` · rest before ${fmtDur(w.rest)}` : ""} · tap to change`} />
          ))}
        </View>
      ) : null}

      <GroupHead left="This workout" right={rows.length ? `${rows.length} sets` : undefined} style={{ marginTop: 18 }} />
      {rows.length ? <SessionSummaryRows rows={rows} /> : <Empty>Pick an exercise, then tap Start set and Set done for each set.</Empty>}
      <Note>Logging without the timer still works. Type it below and it's added to this workout.</Note>
      <View style={{ marginTop: 8 }}>
        <ExerciseInput placeholder="pushups 3x15, plank 60s" button="Log" hint="Add reps or time, like pushups 3x15 or plank 60s"
          onAdd={(e) => { st.addWorkout(e); toast(`Logged ${e.name}`); }} />
      </View>

      <EditSetSheet w={editSet} onClose={() => setEditSet(null)} />
      <RestPicker visible={restPick} name={cur} onClose={() => setRestPick(false)} />
    </View>
  );
}

export function SessionSummaryRows({ rows }: { rows: Workout[] }) {
  const groups = new Map<string, Workout[]>();
  for (const w of rows) groups.set(exKey(w.name), [...(groups.get(exKey(w.name)) ?? []), w]);
  return (
    <>
      {[...groups.values()].map((g) => {
        const reps = sum(g, (w) => w.sets * w.reps), secs = sum(g, (w) => activeSecs(w));
        const sets = sum(g, (w) => Math.max(1, w.sets));
        return (
          <Row key={g[0].id} title={g[0].name}
            sub={`${sets} set${sets === 1 ? "" : "s"}${reps ? ` · ${g.map((w) => w.reps).join(", ")} reps` : ""}${g.some((w) => w.kg) ? ` · ${g.find((w) => w.kg)!.kg} kg` : ""}`}
            right={<T w="semibold">{fmtDur(secs)}</T>} />
        );
      })}
    </>
  );
}

function EditSetSheet({ w, onClose }: { w: Workout | null; onClose: () => void }) {
  const st = useStore(), toast = useToast();
  const [reps, setReps] = useState(""), [kg, setKg] = useState("");
  useEffect(() => { if (w) { setReps(String(w.reps || "")); setKg(w.kg ? String(w.kg) : ""); } }, [w?.id]);
  return (
    <Sheet visible={!!w} onClose={onClose}>
      {w ? (
        <View>
          <T w="bold" size={20}>{w.name}</T>
          <T c={C.muted} size={14}>{w.active != null ? `Took ${fmtDur(w.active)}` : ""}{w.rest ? ` · rest before ${fmtDur(w.rest)}` : ""}</T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><SheetLabel>Reps</SheetLabel><SheetInput value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder="0 for a timed hold" /></View>
            <View style={{ flex: 1 }}><SheetLabel>Weight (kg)</SheetLabel><SheetInput value={kg} onChangeText={setKg} keyboardType="decimal-pad" placeholder="optional" /></View>
          </View>
          <Btn kind="dark" label="Save" style={{ marginTop: 16, paddingVertical: 14 }} onPress={() => {
            const r = Math.max(0, Math.round(+reps || 0));
            st.updateWorkout(w.id, { reps: r, sets: r ? 1 : 0, kg: +kg || 0, dur: r ? 0 : Math.round(w.active ?? w.dur) });
            toast("Set updated"); onClose();
          }} />
          <Btn kind="stop" label="Delete set" style={{ marginTop: 10 }} onPress={() => { st.delWorkout(w.id); toast("Set deleted"); onClose(); }} />
        </View>
      ) : null}
    </Sheet>
  );
}

function RestPicker({ visible, name, onClose }: { visible: boolean; name: string | null; onClose: () => void }) {
  const st = useStore();
  const cur = name ? st.meta[exKey(name)]?.rest_secs ?? null : null;
  return (
    <Sheet visible={visible && !!name} onClose={onClose}>
      <T w="bold" size={20}>Rest alert for {name}</T>
      <Note style={{ marginTop: 4 }}>Default is {fmtDur(st.restAlert.secs)} (change it under the profile icon).</Note>
      <View style={{ marginTop: 12 }}>
        <Chips options={[[0, "Use default"], [30, "30s"], [45, "45s"], [60, "1 min"], [90, "1.5 min"], [120, "2 min"], [180, "3 min"]] as [number, string][]}
          value={cur ?? 0} onPick={(v) => { st.setExerciseRest(name!, v || null); onClose(); }} />
      </View>
    </Sheet>
  );
}

export function SummarySheet({ data, onClose }: { data: SessionResult | null; onClose: () => void }) {
  return (
    <Sheet visible={!!data} onClose={onClose}>
      {data ? (
        <View>
          <T w="bold" size={21}>Workout done</T>
          <T size={15} style={{ marginTop: 6 }}>
            {fmtDur(data.secs)} · exercise {fmtDur(data.active)} · rest {fmtDur(data.rest)} · about {n0(data.kcal)} kcal
          </T>
          <View style={{ marginTop: 12 }}><SessionSummaryRows rows={data.rows} /></View>
          <Btn kind="dark" label="Close" onPress={onClose} style={{ marginTop: 12, paddingVertical: 14 }} />
        </View>
      ) : null}
    </Sheet>
  );
}
