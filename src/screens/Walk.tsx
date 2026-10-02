import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { BarChart, Legend } from "../components/charts";
import RouteMap from "../components/RouteMap";
import { Btn, Chips, Empty, Grid, H2, Note, Panel, Row, Seg, Sheet, T, Tile, Val, Verdict, useToast } from "../components/ui";
import type { Walk as WalkT } from "../lib/types";
import { addDays, dLong, dMed, dNum, dShort, fmtClock, fmtPace, n0, pct, rangeDays, short, sum } from "../lib/util";
import { walkRoute } from "../lib/walkTracker";
import { useStore } from "../store";
import { C } from "../theme";
import { useWalk } from "../walk";

export default function Walk({ pane, setPane }: { pane: string; setPane: (p: string) => void }) {
  return (
    <View>
      <Seg options={[["track", "Track"], ["progress", "Progress"]]} value={pane} onPick={setPane} />
      {pane === "track" ? <Track /> : <Progress />}
    </View>
  );
}

function Track() {
  const st = useStore(), walk = useWalk(), toast = useToast();
  const [busy, setBusy] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [open, setOpen] = useState<WalkT | null>(null);
  const status = walk.active?.status ?? "idle";
  const [here, setHere] = useState<[number, number] | null>(null);

  // show where you are before starting (only if location was already allowed)
  useEffect(() => {
    if (status !== "idle") return;
    let alive = true;
    (async () => {
      try {
        const p = await Location.getForegroundPermissionsAsync();
        if (!p.granted) return;
        const pos = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (alive && pos) setHere([pos.coords.latitude, pos.coords.longitude]);
      } catch { /* map stays on the default view */ }
    })();
    return () => { alive = false; };
  }, [status]);

  const run = async (f: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try { await f(); } catch (e: any) { Alert.alert("Can't track the walk", e?.message ?? String(e)); } finally { setBusy(false); }
  };
  const stop = () =>
    Alert.alert("Finish walk?", `${(walk.m / 1000).toFixed(2)} km in ${fmtClock(walk.secs)}`, [
      { text: "Keep walking", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => run(async () => { await walk.stop(false); toast("Walk discarded"); }) },
      { text: "Save", onPress: () => run(async () => { const s = await walk.stop(true); toast(s ? `Walk saved · ${(s.m / 1000).toFixed(2)} km` : "Too short to save"); }) },
    ]);

  const gps = status === "walking"
    ? walk.acc == null ? "Finding GPS…" : `GPS ±${Math.round(walk.acc)} m`
    : status === "paused" ? "Paused" : "GPS ready";
  // walks grouped by day, newest first
  const [daysShown, setDaysShown] = useState(10);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const byDay = new Map<string, WalkT[]>();
  for (const w of [...st.walks].reverse()) byDay.set(w.date, [...(byDay.get(w.date) ?? []), w]);
  const dayList = [...byDay.entries()];
  const toggleDay = (d: string) => setOpenDays((o) => { const n = new Set(o); n.has(d) ? n.delete(d) : n.add(d); return n; });

  return (
    <View>
      <View>
        <RouteMap route={walk.route} follow={status !== "idle"} style={{ height: 220 }} recenterKey={recenter} here={status === "idle" ? here : null} />
        <View style={[m.badge, { left: 12 }]}>
          <View style={[m.dot, status === "walking" && walk.acc != null && m.live]} />
          <T size={13}>{gps}</T>
        </View>
        {status !== "idle" ? (
          <Pressable style={[m.badge, { right: 12 }]} onPress={() => setRecenter((x) => x + 1)}>
            <T size={13}>Recenter</T>
          </Pressable>
        ) : null}
      </View>
      <View style={{ alignItems: "center", marginTop: 20, marginBottom: 6 }}>
        <T w="bold" size={64} style={{ letterSpacing: -2.5, lineHeight: 70 }}>{fmtClock(walk.secs)}</T>
        <T c={C.muted} size={14} style={{ marginTop: 4 }}>
          {{ idle: "Ready when you are", walking: "Walking — keeps tracking with the screen off", paused: "Paused" }[status]}
        </T>
      </View>
      <View style={m.stats}>
        {[
          [n0(walk.steps), "steps"],
          [(walk.m / 1000).toFixed(2), "km"],
          [fmtPace(walk.secs, walk.m), "pace /km"],
          [String(Math.round(walk.kcal)), "kcal"],
        ].map(([v, k]) => (
          <View key={k} style={{ flex: 1, alignItems: "center" }}>
            <T w="bold" size={20}>{v}</T>
            <T c={C.muted} size={12} style={{ marginTop: 2 }}>{k}</T>
          </View>
        ))}
      </View>
      <View style={m.controls}>
        {status === "idle" ? (
          <Pressable style={[m.go, busy && { opacity: 0.6 }]} onPress={() => run(walk.start)}>
            <T w="bold" size={19} c={C.turmericInk}>Start</T>
          </Pressable>
        ) : (
          <>
            <Pressable style={m.secondary} onPress={stop}><T w="semibold" c={C.danger}>Stop</T></Pressable>
            <Pressable style={[m.go, busy && { opacity: 0.6 }]} onPress={() => run(status === "walking" ? walk.pause : walk.resume)}>
              <T w="bold" size={18} c={C.turmericInk}>{status === "walking" ? "Pause" : "Resume"}</T>
            </Pressable>
          </>
        )}
      </View>
      {status !== "idle" && !walk.usingSensor ? (
        <Note style={{ textAlign: "center" }}>Steps are estimated from distance until the step sensor reports.</Note>
      ) : null}
      <H2>Recent walks</H2>
      {dayList.length ? dayList.slice(0, daysShown).map(([d, ws]) => {
        const isOpen = openDays.has(d);
        const m = sum(ws, (w) => w.m), secs = sum(ws, (w) => w.secs), steps = sum(ws, (w) => w.steps);
        return (
          <View key={d} style={{ marginBottom: 6 }}>
            <Row onPress={() => toggleDay(d)}
              title={<T w="semibold">{dMed(d)}{d === st.todayISO ? " · Today" : ""}</T>}
              sub={`${ws.length} walk${ws.length === 1 ? "" : "s"} · ${fmtClock(secs)} · ${n0(steps)} steps · ${n0(sum(ws, (w) => w.kcal))} kcal`}
              right={<><Val>{(m / 1000).toFixed(2)} km</Val><T c={C.muted} size={16}>{isOpen ? "▾" : "▸"}</T></>} />
            {isOpen ? ws.map((x) => (
              <View key={x.id} style={{ marginLeft: 14 }}>
                <Row onPress={() => setOpen(x)} title={`${x.start} · ${(x.m / 1000).toFixed(2)} km`}
                  sub={`${fmtClock(x.secs)} · ${n0(x.steps)} steps · ${fmtPace(x.secs, x.m)} /km · ${n0(x.kcal)} kcal`}
                  right={<T c={C.leaf} size={13} w="semibold">Map</T>} />
              </View>
            )) : null}
          </View>
        );
      }) : <Empty>No walks yet. Tap Start when you head out.</Empty>}
      {dayList.length > daysShown ? (
        <Pressable onPress={() => setDaysShown(daysShown + 14)} style={{ alignItems: "center", paddingVertical: 10 }}>
          <T c={C.leaf} w="semibold" size={14}>Show earlier days</T>
        </Pressable>
      ) : null}
      <WalkSheet walk={open} onClose={() => setOpen(null)} />
    </View>
  );
}

function WalkSheet({ walk, onClose }: { walk: WalkT | null; onClose: () => void }) {
  const st = useStore(), toast = useToast();
  const route = useMemo(() => (walk ? walkRoute(walk.id) : []), [walk?.id]);
  return (
    <Sheet visible={!!walk} onClose={onClose}>
      {walk ? (
        <View>
          <T w="bold" size={20} style={{ marginBottom: 10 }}>{dLong(walk.date)} · {walk.start}</T>
          {route.length ? <RouteMap route={route} style={{ height: 220 }} /> : <Note>No route was recorded for this walk.</Note>}
          <Grid>
            <Tile k="Distance" v={(walk.m / 1000).toFixed(2)} unit="km" />
            <Tile k="Time" v={fmtClock(walk.secs)} />
            <Tile k="Steps" v={n0(walk.steps)} />
            <Tile k="Pace" v={fmtPace(walk.secs, walk.m)} unit="/km" />
            <Tile k="Calories" v={n0(walk.kcal)} unit="kcal" />
          </Grid>
          <Btn kind="stop" label="Delete this walk" style={{ marginTop: 18 }} onPress={() =>
            Alert.alert("Delete this walk?", "This can't be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => { st.delWalk(walk.id); onClose(); toast("Walk deleted"); } },
            ])} />
        </View>
      ) : null}
    </Sheet>
  );
}

const METRICS = {
  km: { label: "Distance", get: (ws: WalkT[]) => sum(ws, (w) => w.m) / 1000, fmt: (v: number) => v.toFixed(v < 10 ? 1 : 0), show: (v: number) => `${v.toFixed(2)} km` },
  steps: { label: "Steps", get: (ws: WalkT[]) => sum(ws, (w) => w.steps), fmt: short, show: (v: number) => `${n0(v)} steps` },
  kcal: { label: "Calories burned", get: (ws: WalkT[]) => sum(ws, (w) => w.kcal), fmt: short, show: (v: number) => `${n0(v)} kcal` },
};
type MetricKey = keyof typeof METRICS;

function Progress() {
  const st = useStore(), walk = useWalk();
  const [range, setRange] = useState(14);
  const [metric, setMetric] = useState<MetricKey>("km");
  const [cap, setCap] = useState<string | null>(null);
  const M = METRICS[metric];
  const days = rangeDays(range);
  const all: WalkT[] = st.walks.concat(
    walk.active ? [{ id: "live", date: walk.active.date, start: walk.active.start, secs: walk.secs, m: walk.m, steps: walk.steps, kcal: walk.kcal }] : [],
  );
  const vals = days.map((d) => M.get(all.filter((w) => w.date === d)));
  const avg7 = vals.map((_, i) => { const win = vals.slice(Math.max(0, i - 6), i + 1); return sum(win, (v) => v) / win.length; });
  const total = sum(vals, (v) => v), active = vals.filter((v) => v > 0).length;
  const prevTotal = sum(days.map((d) => addDays(d, -range)), (d) => M.get(st.walks.filter((w) => w.date === d)));
  const change = pct(total, prevTotal), best = Math.max(0, ...vals);

  return (
    <View>
      <Chips options={[[7, "7 days"], [14, "14 days"], [30, "30 days"]]} value={range} onPick={(v) => { setRange(v); setCap(null); }} />
      <Chips options={[["km", "Distance"], ["steps", "Steps"], ["kcal", "Calories burned"]]} value={metric} onPick={(v) => { setMetric(v as MetricKey); setCap(null); }} />
      <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginHorizontal: 4, marginBottom: 8 }}>
          <T w="semibold">{M.label} per day</T>
          <T c={C.muted} size={13}>{dShort(days[0])} – {dShort(days[days.length - 1])}</T>
        </View>
        <BarChart values={vals} labels={days.map(dNum)} colors={vals.map(() => C.leaf)} line={avg7} fmt={M.fmt}
          onTap={(i) => setCap(`${dLong(days[i])} · ${vals[i] ? M.show(vals[i]) : "no walk"}`)} />
        <Legend items={[[C.leaf, "Per day"], [C.ink, "7-day average", true]]} />
        <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that day."}</T>
      </Panel>
      <Grid>
        <Tile k="Total" v={M.show(total)} />
        <Tile k="Days walked" v={active} unit={`of ${days.length}`} />
        <Tile k="Average per walk day" v={active ? M.show(total / active) : "–"} />
        <Tile k="Best day" v={best ? M.show(best) : "–"} />
      </Grid>
      <Verdict tone={change > 5 ? "up" : change < -5 ? "down" : "flat"}>
        {prevTotal
          ? `${change > 0 ? "+" : ""}${change}% vs the previous ${range} days (${M.show(prevTotal)}). ${change > 5 ? "You're walking more." : change < -5 ? "You've walked less than before." : "About the same as before."}`
          : "Not enough earlier data to compare yet."}
      </Verdict>
    </View>
  );
}

const m = StyleSheet.create({
  badge: {
    position: "absolute", top: 12, backgroundColor: "rgba(251,252,249,0.94)", paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.muted },
  live: { backgroundColor: C.leaf },
  stats: { flexDirection: "row", marginTop: 18, marginBottom: 20 },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 22, minHeight: 110 },
  go: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.turmeric, alignItems: "center", justifyContent: "center", elevation: 3 },
  secondary: { width: 74, height: 74, borderRadius: 37, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, alignItems: "center", justifyContent: "center" },
});
