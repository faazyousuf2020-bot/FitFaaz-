import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { MacroBars } from "../components/MacroBars";
import { Empty, Grid, H2, Meter, Note, Panel, Rest, T, Tile } from "../components/ui";
import { dayWorkout } from "../lib/burn";
import { mealNow } from "../lib/food";
import { foodOn, walkOn } from "../lib/stats";
import { fmtDur, n0 } from "../lib/util";
import { bmr, useStore } from "../store";
import { C } from "../theme";
import { useWalk } from "../walk";
import { PlanRow } from "./PlanRows";

function Split({ title, total, unit, parts, onPress }: {
  title: string; total: string; unit?: string; parts: [string, string, string][]; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flexBasis: "48%", flexGrow: 1, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.line }}>
      <T c={C.muted} size={13}>{title}</T>
      <T w="bold" size={23} style={{ marginTop: 4, letterSpacing: -0.4 }}>
        {total}{unit ? <T w="medium" size={13} c={C.muted} style={{ letterSpacing: 0 }}> {unit}</T> : null}
      </T>
      <View style={{ marginTop: 8, gap: 3 }}>
        {parts.map(([label, v, color]) => (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <T size={13} c={C.muted} style={{ flex: 1 }}>{label}</T>
            <T size={13} w="semibold">{v}</T>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default function Today({ go, openProfile }: { go: (tab: string, pane?: string) => void; openProfile: () => void }) {
  const st = useStore(), walk = useWalk();
  const d = st.todayISO;
  // refresh every few seconds while a workout is running so the numbers move
  const [, tick] = useState(0);
  useEffect(() => {
    if (!st.live) return;
    const h = setInterval(() => tick((x) => x + 1), 5000);
    return () => clearInterval(h);
  }, [!!st.live]);

  const eaten = foodOn(st.food, d);
  const liveWalk = walk.active ? { date: walk.active.date, secs: walk.secs, m: walk.m, steps: walk.steps, kcal: walk.kcal } : null;
  const wk = walkOn(st.walks, d, liveWalk);
  const wo = dayWorkout(d, st.workouts, st.sessions, st.categories, st.meta, st.profile.weight, st.live);
  const burned = wk.kcal + wo.kcal;
  const maint = bmr(st.profile) * 1.2 + burned;
  const over = eaten.kcal > maint;
  const plan = st.plan.filter((p) => p.date === d);
  const liveOn = walk.active && walk.active.date === d;

  return (
    <View>
      {!st.profileSet ? (
        <Pressable onPress={openProfile} style={{ backgroundColor: C.turmericSoft, borderRadius: 16, padding: 14, marginBottom: 10 }}>
          <T w="semibold" c={C.turmericInk}>Set your weight, height and age</T>
          <T size={13} c={C.turmericInk} style={{ marginTop: 2 }}>Calories, maintenance and macro targets use them. Tap here.</T>
        </Pressable>
      ) : null}
      <Pressable onPress={() => go("food", "log")}>
        <Panel style={{ paddingVertical: 22, paddingHorizontal: 20, backgroundColor: C.ink, borderColor: C.ink }}>
          <T c={C.inkMuted} size={14}>Eaten today</T>
          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <T w="bold" size={52} c={C.inkText} style={{ letterSpacing: -2, lineHeight: 58 }}>{n0(eaten.kcal)}</T>
            <T w="medium" size={16} c={C.inkMuted} style={{ marginLeft: 8 }}>of ~{n0(maint)} kcal</T>
          </View>
          <Meter frac={maint ? eaten.kcal / maint : 0} over={over} dark />
          <Note style={{ marginTop: 8, color: over ? "#FF6B7F" : C.inkMuted }}>
            {over ? `${n0(eaten.kcal - maint)} kcal above your estimated maintenance today.` : `${n0(maint - eaten.kcal)} kcal below your estimated maintenance so far.`}
            {eaten.kcal === 0 ? ` Tap to log ${mealNow()}.` : ""}
          </Note>
          <MacroBars p={eaten.p} c={eaten.c} f={eaten.f} targets={st.targets} dark />
        </Panel>
      </Pressable>
      <Grid style={{ marginTop: 8 }}>
        <Tile k="Steps" v={n0(wk.steps)} onPress={() => go("walk", "track")} />
        <Tile k="Walked" v={(wk.m / 1000).toFixed(2)} unit="km" onPress={() => go("walk", "track")} />
        <Split title="Calories burned" total={n0(burned)} unit="kcal" onPress={() => go("workout", "log")}
          parts={[["Walking", n0(wk.kcal), C.leaf], ["Workout", `${wo.estimated && wo.kcal ? "~" : ""}${n0(wo.kcal)}`, C.ink]]} />
        <Split title="Active time" total={fmtDur(wk.secs + wo.secs)} onPress={() => go("workout", "log")}
          parts={[["Walking", fmtDur(wk.secs), C.leaf], ["Workout", `${wo.estimated && wo.secs ? "~" : ""}${fmtDur(wo.secs)}`, C.ink]]} />
      </Grid>
      {wo.secs > 0 ? (
        <T c={C.muted} size={13} style={{ marginTop: 6, marginHorizontal: 4 }}>
          Workout: exercise {fmtDur(wo.active)} · rest {fmtDur(wo.rest)}{wo.estimated ? " · ~ estimated from sets" : ""}
        </T>
      ) : null}
      {liveOn ? (
        <Pressable onPress={() => go("walk", "track")} style={{ marginTop: 8, backgroundColor: C.leafSoft, borderRadius: 14, padding: 12 }}>
          <T w="semibold">{walk.active!.status === "walking" ? "Walk in progress" : "Walk paused"} · {(walk.m / 1000).toFixed(2)} km</T>
        </Pressable>
      ) : null}
      {st.live ? (
        <Pressable onPress={() => go("workout", "log")} style={{ marginTop: 8, backgroundColor: C.turmericSoft, borderRadius: 14, padding: 12 }}>
          <T w="semibold" c={C.turmericInk}>Workout running · {fmtDur((Date.now() - st.live.startedAt) / 1000)} · tap to open</T>
        </Pressable>
      ) : null}
      <H2>Today's plan</H2>
      {st.restDays.has(d) ? <Rest>Rest day</Rest>
        : plan.length ? plan.map((it) => <PlanRow key={it.id} item={it} withLog onGoWalk={() => go("walk", "track")} />)
        : <Empty>Nothing planned for today. Plan your week under Workout → Plan.</Empty>}
    </View>
  );
}
