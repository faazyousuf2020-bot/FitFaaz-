import React from "react";
import { Pressable, View } from "react-native";
import { Empty, Grid, H2, Meter, Note, Panel, Rest, T, Tile } from "../components/ui";
import { mealNow } from "../lib/food";
import { n0, sum } from "../lib/util";
import { bmr, useStore } from "../store";
import { C } from "../theme";
import { useWalk } from "../walk";
import { PlanRow } from "./PlanRows";

export default function Today({ go, openProfile }: { go: (tab: string, pane?: string) => void; openProfile: () => void }) {
  const st = useStore(), walk = useWalk();
  const d = st.todayISO;
  const eaten = sum(st.food.filter((f) => f.date === d), (f) => f.kcal);
  const walks = st.walks.filter((w) => w.date === d);
  const liveOn = walk.active && walk.active.date === d;
  const burn = sum(walks, (w) => w.kcal) + (liveOn ? walk.kcal : 0);
  const steps = sum(walks, (w) => w.steps) + (liveOn ? walk.steps : 0);
  const km = (sum(walks, (w) => w.m) + (liveOn ? walk.m : 0)) / 1000;
  const maint = bmr(st.profile) * 1.2 + burn;
  const workMin = sum(st.sessions.filter((s) => s.date === d), (s) => s.secs) / 60 +
    (st.sessionStart ? (Date.now() - st.sessionStart) / 60000 : 0);
  const plan = st.plan.filter((p) => p.date === d);
  const over = eaten > maint;

  return (
    <View>
      {!st.profileSet ? (
        <Pressable onPress={openProfile} style={{ backgroundColor: C.turmericSoft, borderRadius: 16, padding: 14, marginBottom: 10 }}>
          <T w="semibold" c={C.turmericInk}>Set your weight, height and age</T>
          <T size={13} c={C.turmericInk} style={{ marginTop: 2 }}>Calories and maintenance use them. Tap here.</T>
        </Pressable>
      ) : null}
      <Pressable onPress={() => go("food", "log")}>
        <Panel style={{ paddingVertical: 22, paddingHorizontal: 20 }}>
          <T c={C.muted} size={14}>Eaten today</T>
          <T w="bold" size={52} style={{ letterSpacing: -2, lineHeight: 58, marginTop: 6, marginBottom: 10 }}>
            {n0(eaten)}<T w="medium" size={16} c={C.muted}>  of ~{n0(maint)} kcal</T>
          </T>
          <Meter frac={maint ? eaten / maint : 0} over={over} />
          <Note style={{ marginTop: 8 }}>
            {over ? `${n0(eaten - maint)} kcal above your estimated maintenance today.` : `${n0(maint - eaten)} kcal below your estimated maintenance so far.`}
            {eaten === 0 ? ` Tap to log ${mealNow()}.` : ""}
          </Note>
        </Panel>
      </Pressable>
      <Grid style={{ marginTop: 8 }}>
        <Tile k="Steps" v={n0(steps)} onPress={() => go("walk", "track")} />
        <Tile k="Walked" v={km.toFixed(2)} unit="km" onPress={() => go("walk", "track")} />
        <Tile k="Burned walking" v={n0(burn)} unit="kcal" onPress={() => go("walk", "progress")} />
        <Tile k="Workout" v={Math.round(workMin)} unit="min" onPress={() => go("workout", "log")} />
      </Grid>
      {liveOn ? (
        <Pressable onPress={() => go("walk", "track")} style={{ marginTop: 8, backgroundColor: C.leafSoft, borderRadius: 14, padding: 12 }}>
          <T w="semibold">{walk.active!.status === "walking" ? "Walk in progress" : "Walk paused"} · {(walk.m / 1000).toFixed(2)} km</T>
        </Pressable>
      ) : null}
      <H2>Today's plan</H2>
      {st.restDays.has(d) ? <Rest>Rest day</Rest>
        : plan.length ? plan.map((it) => <PlanRow key={it.id} item={it} withLog onGoWalk={() => go("walk", "track")} />)
        : <Empty>Nothing planned for today. Plan your week under Workout → Plan.</Empty>}
    </View>
  );
}
