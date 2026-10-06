import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Vibration, View } from "react-native";
import { Btn, Chips, GroupHead, Note, Panel, Row, Sheet, SheetInput, SheetLabel, Stepper, T, useToast } from "../../components/ui";
import { activeSecs, liveExtra, MAX_REST, restSecs, sessionTotals } from "../../lib/burn";
import { categoryOf, exKey } from "../../lib/categories";
import { cancelRestAlert, scheduleRestAlert } from "../../lib/reminders";
import type { PlanItem, Workout } from "../../lib/types";
import { fmtClock, fmtDur, n0, sum } from "../../lib/util";
import { isWalk, setText, setsRepsText, woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import { ExerciseInput, useCatName, useKnownNames } from "./shared";

export type SessionResult = { secs: number; active: number; rest: number; kcal: number; wall: number; rows: Workout[] };

/** The Log tab while a workout is running: Start set → Finish set → rest → Start next set. */
export default function Session({ onFinished }: { onFinished: (r: SessionResult) => void }) {
  const st = useStore(), toast = useToast();
  const live = st.live!;
  const [now, setNow] = useState(Date.now());
  const [other, setOther] = useState(false);
  const [editSet, setEditSet] = useState<Workout | null>(null);
  const [restPick, setRestPick] = useState(false);
  const [repsNow, setRepsNow] = useState<number | null>(null);
  const [kgNow, setKgNow] = useState<number | null>(null);
  const vibrated = useRef(false);
  const known = useKnownNames();
  const catName = useCatName();

  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(h);
  }, []);

  /* ---------- numbers ---------- */
  const rows = st.workouts.filter((w) => w.session_id === live.id);
  const x = liveExtra(live, now);
  const exercise = sum(rows, (w) => activeSecs(w)) + x.active;
  const rest = sum(rows, (w) => restSecs(w)) + x.rest;
  const setSecs = live.setStartedAt ? (now - live.setStartedAt) / 1000 : 0;
  const restNow = !live.setStartedAt && live.lastSetEndedAt ? (now - live.lastSetEndedAt) / 1000 : 0;

  /* ---------- the exercise in hand ---------- */
  const cur = live.current;
  const planToday = st.plan.filter((p) => p.date === st.todayISO && !isWalk(p.name));
  const setsToday = (name: string) => st.workouts.filter((w) => w.date === st.todayISO && exKey(w.name) === exKey(name));
  const setCount = (name: string) => sum(setsToday(name), (w) => Math.max(1, w.sets));
  const plannedSets = (p: PlanItem) => Math.max(1, p.sets || 1);
  const isDone = (p: PlanItem) => setCount(p.name) >= plannedSets(p);
  const planned = cur ? planToday.find((p) => exKey(p.name) === exKey(cur)) : undefined;
  const curRows = cur ? rows.filter((w) => exKey(w.name) === exKey(cur)) : [];
  const doneSets = cur ? setCount(cur) : 0;
  const totalSets = planned ? plannedSets(planned) : null;
  const complete = !!planned && doneSets >= totalSets! && !live.setStartedAt;
  const nextUp = planToday.find((p) => !isDone(p) && (!cur || exKey(p.name) !== exKey(cur)));
  const lastEver = cur ? [...st.workouts].reverse().find((w) => exKey(w.name) === exKey(cur)) : undefined;
  const timed = planned ? !planned.reps && planned.dur > 0 : !!lastEver && !lastEver.reps && lastEver.dur > 0;
  const nextReps = curRows.length ? curRows[curRows.length - 1].reps : planned?.reps || lastEver?.reps || 10;
  const nextKg = curRows.length ? curRows[curRows.length - 1].kg : planned?.kg || lastEver?.kg || 0;
  const setNo = doneSets + 1;
  const setLabel = totalSets ? `${setNo} of ${totalSets}` : `${setNo}`;

  const restTarget = cur ? st.meta[exKey(cur)]?.rest_secs ?? st.restAlert.secs : st.restAlert.secs;
  const restOver = st.restAlert.on && restNow >= restTarget;
  // vibrate in the app when rest is over (the notification covers the phone being locked)
  useEffect(() => {
    if (!st.restAlert.on || !restNow) { vibrated.current = false; return; }
    if (restNow >= restTarget && !vibrated.current) {
      vibrated.current = true;
      Vibration.vibrate([0, 400, 200, 400]);
      cancelRestAlert();
    }
  }, [restNow >= restTarget, st.restAlert.on, live.lastSetEndedAt]);

  const others = useMemo(() => known.filter((k) => !isWalk(k) && !planToday.some((p) => exKey(p.name) === exKey(k))).slice(0, 8),
    [known.length, planToday.length]);

  /* ---------- actions ---------- */
  const pick = (name: string) => { st.setLive({ current: name }); setOther(false); };
  const startSet = () => {
    if (!cur) return;
    cancelRestAlert();
    vibrated.current = false;
    setRepsNow(null); setKgNow(null);
    st.setLive({ setStartedAt: Date.now() });
  };
  const finishSet = () => {
    if (!cur || !live.setStartedAt) return;
    st.endSet({ name: cur, sets: 1, reps: timed ? 0 : repsNow ?? nextReps, dur: 0, kg: kgNow ?? nextKg });
    setRepsNow(null); setKgNow(null);
    const willBeComplete = !!planned && doneSets + 1 >= plannedSets(planned);
    if (st.restAlert.on && !willBeComplete) scheduleRestAlert(restTarget, cur);
    if (willBeComplete) toast(`${cur} done · ${doneSets + 1} sets`);
  };
  const endExercise = () => { cancelRestAlert(); st.setLive({ current: null }); };
  const finish = () => Alert.alert("Finish workout?", `Exercise ${fmtDur(exercise)} · rest ${fmtDur(rest)}`, [
    { text: "Keep going", style: "cancel" },
    { text: "Discard", style: "destructive", onPress: () => Alert.alert("Discard this workout?", "All sets from this workout will be deleted.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { cancelRestAlert(); st.discardSession(); toast("Workout discarded"); } },
    ]) },
    { text: "Finish", onPress: () => {
      cancelRestAlert();
      const res = st.stopSession();
      if (!res || !res.rows.length) { toast("Workout ended · no sets logged"); return; }
      const t = sessionTotals(res.rows, st.categories, st.meta, st.profile.weight);
      onFinished({ ...t, wall: res.secs, rows: res.rows });
    } },
  ]);

  /* ---------- screen ---------- */
  const bigBtn = (label: string, onPress: () => void, dark?: boolean) => (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => ({ marginTop: 16, alignSelf: "stretch", paddingVertical: 20, borderRadius: 18, alignItems: "center",
        backgroundColor: dark ? C.ink : C.turmeric, opacity: pressed ? 0.85 : 1 })}>
      <T w="bold" size={20} c={dark ? C.inkText : C.turmericInk}>{label}</T>
    </Pressable>
  );

  return (
    <View>
      {/* totals */}
      <Panel style={{ backgroundColor: C.ink, borderColor: C.ink, paddingVertical: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <T c={C.inkMuted} size={13}>Workout</T>
            <T w="bold" size={28} c={C.inkText} style={{ letterSpacing: -1 }}>{fmtClock(exercise + rest)}</T>
            <T size={13} c={C.inkMuted}>
              <T size={13} w="semibold" c={C.leaf}>Exercise {fmtClock(exercise)}</T>  ·  Rest {fmtClock(rest)}
            </T>
          </View>
          <Pressable onPress={finish} style={{ borderWidth: 1.5, borderColor: C.danger, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 }}>
            <T w="semibold" c="#FF6B7F">Finish</T>
          </Pressable>
        </View>
      </Panel>

      {/* the control for the set in hand — always right here at the top */}
      <Panel style={{ marginTop: 10, alignItems: "center", paddingVertical: 20 }}>
        {!cur ? (
          <>
            <T w="bold" size={20}>{rows.length ? "What's next?" : "Pick your first exercise"}</T>
            <T c={C.muted} size={14} style={{ marginTop: 2, textAlign: "center" }}>
              {nextUp ? "Next in today's plan is below." : planToday.length ? "Everything planned for today is done." : "Pick from the list below, or add one."}
            </T>
            {nextUp ? bigBtn(`Start ${nextUp.name}`, () => pick(nextUp.name)) : null}
          </>
        ) : complete ? (
          <>
            <T w="bold" size={22}>✓ {cur} done</T>
            <T c={C.muted} size={14} style={{ marginTop: 2 }}>
              {doneSets} sets · exercise {fmtDur(sum(curRows, (w) => activeSecs(w)))} · rest {fmtDur(sum(curRows, (w) => restSecs(w)))}
            </T>
            {nextUp ? bigBtn(`Next: ${nextUp.name}`, () => pick(nextUp.name)) : (
              <T w="semibold" c={C.tealText} style={{ marginTop: 14 }}>All planned exercises done. Tap Finish when you're through.</T>
            )}
            <Pressable onPress={startSet} style={{ marginTop: 12 }}><T c={C.tealText} w="semibold" size={14}>Do one more set</T></Pressable>
          </>
        ) : live.setStartedAt ? (
          <>
            <T w="bold" size={22}>{cur}</T>
            <T c={C.muted} size={14} style={{ marginTop: 2 }}>
              Set {setLabel}{planned ? ` · plan ${setsRepsText(planned)}` : ""}{timed && planned?.dur ? ` · hold ${fmtDur(planned.dur)}` : ""}
            </T>
            <T w="bold" size={64} c={C.tealText} style={{ letterSpacing: -2, marginTop: 6 }}>{fmtClock(setSecs)}</T>
            {!timed ? (
              <View style={{ flexDirection: "row", gap: 10, alignSelf: "stretch", marginTop: 8 }}>
                <Stepper label={`Reps in set ${setNo}`} value={repsNow ?? nextReps} onChange={setRepsNow} min={1} max={300} />
                {(kgNow ?? nextKg) ? <Stepper label="Weight" value={kgNow ?? nextKg} onChange={setKgNow} min={0} max={500} step={(v) => (v < 10 ? 0.5 : 2.5)} format={(v) => `${v} kg`} /> : null}
              </View>
            ) : null}
            {bigBtn(`Finish set ${setNo}`, finishSet, true)}
            <Pressable onPress={() => st.setLive({ setStartedAt: null })} style={{ marginTop: 12 }}>
              <T c={C.muted} size={14}>Cancel this set</T>
            </Pressable>
          </>
        ) : (
          <>
            <T w="bold" size={22}>{cur}</T>
            <T c={C.muted} size={14} style={{ marginTop: 2 }}>
              {catName(categoryOf(cur, st.meta, nextKg))}{planned ? ` · plan ${setsRepsText(planned)}` : ` · next set ${timed ? "timed" : `${nextReps} reps`}`}
            </T>
            {curRows.length && live.lastSetEndedAt ? (
              <>
                <T w="bold" size={64} c={restOver ? C.danger : C.ink} style={{ letterSpacing: -2, marginTop: 6 }}>{fmtClock(restNow)}</T>
                <T c={restOver ? C.danger : C.muted} size={14} w={restOver ? "semibold" : "regular"}>
                  {restOver ? "Rest is over" : `Resting between sets${st.restAlert.on ? ` · alert at ${fmtDur(restTarget)}` : ""}`}
                  {restNow > MAX_REST ? " · counted as 5 min" : ""}
                </T>
              </>
            ) : <T c={C.muted} size={14} style={{ marginTop: 10 }}>Tap when you begin</T>}
            {bigBtn(`Start set ${setLabel}`, startSet)}
            {doneSets ? (
              <Pressable onPress={endExercise} style={{ marginTop: 12 }}>
                <T c={C.tealText} w="semibold" size={14}>{planned ? `End ${cur} early` : `Done with ${cur}`}</T>
              </Pressable>
            ) : null}
            {st.restAlert.on ? (
              <Pressable onPress={() => setRestPick(true)} style={{ marginTop: 10 }}>
                <T c={C.muted} size={13}>Rest alert for {cur}: {fmtDur(restTarget)} · change</T>
              </Pressable>
            ) : null}
          </>
        )}
      </Panel>

      {/* this exercise's sets */}
      {curRows.length ? (
        <View style={{ marginTop: 10 }}>
          {curRows.map((w, i) => (
            <Row key={w.id} onPress={() => setEditSet(w)} title={`Set ${i + 1} · ${setText(w) || fmtDur(w.dur)}`}
              sub={`${w.active != null ? `took ${fmtDur(w.active)}` : "not timed"}${i > 0 && w.rest ? ` · rest before ${fmtDur(Math.min(w.rest, MAX_REST))}` : ""} · tap to change`} />
          ))}
        </View>
      ) : null}

      {/* today's plan as a checklist */}
      {planToday.length ? (
        <>
          <GroupHead left="Today's plan" right={`${planToday.filter(isDone).length} of ${planToday.length} done`} style={{ marginTop: 16 }} />
          {planToday.map((p) => {
            const on = !!cur && exKey(p.name) === exKey(cur);
            const rs = setsToday(p.name);
            const n = sum(rs, (w) => Math.max(1, w.sets)), secs = sum(rs, (w) => activeSecs(w));
            const done = isDone(p);
            return (
              <Pressable key={p.id} onPress={() => pick(p.name)} disabled={!!live.setStartedAt}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, marginBottom: 6,
                  backgroundColor: on ? C.ink : C.surface, opacity: live.setStartedAt && !on ? 0.45 : 1 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center",
                  backgroundColor: done ? C.leaf : "transparent", borderWidth: done ? 0 : 1.5, borderColor: on ? C.inkMuted : C.line }}>
                  <T w="bold" size={12} c={C.ink}>{done ? "✓" : ""}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T w="semibold" c={on ? C.inkText : C.ink}>{p.name}</T>
                  <T size={13} c={on ? C.inkMuted : C.muted}>
                    {woDesc(p).join(" ")} · {Math.min(n, plannedSets(p))} of {plannedSets(p)} sets{secs ? ` · ${fmtDur(secs)}` : ""}
                  </T>
                </View>
                <T size={13} w="semibold" c={on ? C.leaf : C.tealText}>{on ? "Now" : done ? "" : "Switch"}</T>
              </Pressable>
            );
          })}
        </>
      ) : null}

      <GroupHead left={planToday.length ? "Other exercises" : "Exercises"} style={{ marginTop: 12 }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {others.map((n) => {
          const on = !!cur && exKey(n) === exKey(cur);
          return (
            <Pressable key={n} onPress={() => pick(n)} disabled={!!live.setStartedAt}
              style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? C.ink : C.sunk, opacity: live.setStartedAt && !on ? 0.4 : 1 }}>
              <T size={14} c={on ? C.surface : C.ink}>{n}</T>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setOther(!other)} disabled={!!live.setStartedAt}
          style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line }}>
          <T size={14}>+ Other exercise</T>
        </Pressable>
      </View>
      {other ? (
        <ExerciseInput placeholder="Exercise and plan, e.g. burpees 3x10" button="Pick" hint="Type a name, plus reps or time, like burpees 3x10"
          onAdd={(e) => pick(e.name)} />
      ) : null}
      <Note>Rest is the time between finishing one set and starting the next (up to 5 minutes per break). Time before your first set or after your last set isn't counted.</Note>

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
        const reps = sum(g, (w) => w.sets * w.reps), secs = sum(g, (w) => activeSecs(w)), r = sum(g, (w) => restSecs(w));
        const sets = sum(g, (w) => Math.max(1, w.sets));
        return (
          <Row key={g[0].id} title={g[0].name}
            sub={`${sets} set${sets === 1 ? "" : "s"}${reps ? ` · ${g.map((w) => w.reps).join(", ")} reps` : ""}${g.some((w) => w.kg) ? ` · ${g.find((w) => w.kg)!.kg} kg` : ""} · rest ${fmtDur(r)}`}
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
          <T c={C.muted} size={14}>{w.active != null ? `Took ${fmtDur(w.active)}` : ""}{w.rest ? ` · rest before ${fmtDur(Math.min(w.rest, MAX_REST))}` : ""}</T>
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
