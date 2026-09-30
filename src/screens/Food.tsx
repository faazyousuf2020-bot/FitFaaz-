import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { BarChart, Legend } from "../components/charts";
import { Chips, Del, Empty, Field, Grid, GroupHead, Note, Panel, Row, Seg, T, Tile, useToast } from "../components/ui";
import { MEALS, OffResult, foodCalc, mealNow, parseFood, searchOFF } from "../lib/food";
import { cap1, dLong, dNum, dShort, n0, rangeDays, sum } from "../lib/util";
import { bmr, useStore } from "../store";
import { C } from "../theme";

export default function Food({ pane, setPane }: { pane: string; setPane: (p: string) => void }) {
  return (
    <View>
      <Seg options={[["log", "Log"], ["progress", "Progress"]]} value={pane} onPick={setPane} />
      {pane === "log" ? <Log /> : <Progress />}
    </View>
  );
}

function Log() {
  const st = useStore(), toast = useToast();
  const [text, setText] = useState("");
  const [manual, setManual] = useState("");
  const [meal, setMeal] = useState<string | null>(null);
  const [results, setResults] = useState<OffResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(false);
  const curMeal = meal ?? mealNow();
  const r = text.trim() ? foodCalc(text, st.custom) : null;
  const unknownFood = r && r.unknown ? r.food : null;

  // look unknown foods up online
  useEffect(() => {
    setResults(null); setSearchErr(false);
    if (!unknownFood || unknownFood.length < 3) return;
    const ctl = new AbortController();
    const h = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchOFF(unknownFood, ctl.signal)); }
      catch { if (!ctl.signal.aborted) setSearchErr(true); }
      finally { if (!ctl.signal.aborted) setSearching(false); }
    }, 600);
    return () => { clearTimeout(h); ctl.abort(); setSearching(false); };
  }, [unknownFood]);

  const canAdd = !!r && (!r.unknown || +manual > 0);
  const add = () => {
    if (!r) return;
    let kcal: number, src: string;
    if (r.unknown) {
      const k = +manual;
      if (!(k > 0)) return;
      st.saveCustom({ name: r.food, kcal_serving: k, kcal100: null, serving_g: null, src: "your value" });
      kcal = r.q * k; src = "your value";
    } else { kcal = r.kcal; src = r.src; }
    st.addFood(text.trim(), kcal, src, curMeal);
    setText(""); setManual("");
    toast(`Added · ${Math.round(kcal)} kcal`);
  };
  const pick = (o: OffResult) => {
    const p = parseFood(text);
    st.saveCustom({ name: p.food, kcal_serving: null, kcal100: o.kcal100, serving_g: o.serving_g, src: "Open Food Facts" });
  };

  const items = st.food.filter((f) => f.date === st.todayISO);
  const recent = useMemo(() => {
    const seen = new Set<string>(), out: { entry: string; kcal: number; src: string }[] = [];
    for (let i = st.food.length - 1; i >= 0 && out.length < 8; i--) {
      const f = st.food[i], k = f.entry.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k); out.push(f);
    }
    return out;
  }, [st.food]);

  return (
    <View>
      <Field value={text} onChangeText={setText} placeholder="2 idli, 1 cup sambar, 150g biryani" button="Add"
        disabled={!canAdd} onSubmit={add} autoCorrect={false} autoCapitalize="none" />
      <View style={{ minHeight: 22, paddingTop: 8, paddingHorizontal: 6 }}>
        {r && !r.unknown ? (
          <T c={C.muted} size={14}>
            <T w="semibold" size={14}>{cap1(r.label)}</T>{r.grams ? `, about ${Math.round(r.grams)} g` : ""} → <T w="semibold" size={14}>{Math.round(r.kcal)} kcal</T> · {r.src}
          </T>
        ) : null}
        {r && r.unknown ? (
          <T c={C.muted} size={14}><T w="semibold" size={14}>{r.food}</T> isn't in the built-in list. Pick a match below, or type calories for one {r.unit || "serving"}.</T>
        ) : null}
      </View>
      {r && r.unknown ? (
        <View>
          <View style={{ marginTop: 6 }}>
            <Field value={manual} onChangeText={setManual} placeholder="Calories per serving" keyboardType="numeric" onSubmit={add} />
          </View>
          <View style={{ marginTop: 10 }}>
            {searching ? <View style={{ flexDirection: "row", gap: 8, padding: 6 }}><ActivityIndicator color={C.leaf} /><T c={C.muted} size={14}>Searching Open Food Facts…</T></View> : null}
            {searchErr ? <Note>Couldn't reach Open Food Facts. Check your internet, or enter calories above.</Note> : null}
            {results && !results.length ? <Note>No online match. Enter calories above; FitFaaz will remember them.</Note> : null}
            {results?.map((o) => (
              <Row key={o.name} onPress={() => pick(o)} title={o.name}
                sub={`${o.kcal100} kcal per 100 g${o.serving_g ? ` · serving ${Math.round(o.serving_g)} g` : ""}`}
                right={<T w="semibold" c={C.leaf} size={14}>Use</T>} />
            ))}
          </View>
        </View>
      ) : null}
      <Chips style={{ marginTop: 10 }} options={MEALS.map((x) => [x, cap1(x)] as [string, string])} value={curMeal} onPick={setMeal} />
      {!text && recent.length ? (
        <View>
          <T c={C.muted} size={13} style={{ marginHorizontal: 4, marginBottom: 6 }}>Tap to log again</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {recent.map((f) => (
              <Pressable key={f.entry} onPress={() => { st.addFood(f.entry, f.kcal, f.src, curMeal); toast(`Added · ${Math.round(f.kcal)} kcal`); }}
                style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface }}>
                <T size={14}>{f.entry} · {Math.round(f.kcal)}</T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <GroupHead left="Today" right={`${n0(sum(items, (f) => f.kcal))} kcal`} style={{ marginTop: 22 }} />
      {!items.length ? <Empty>Nothing logged today. Type what you ate above.</Empty> : MEALS.map((ml) => {
        const g = items.filter((f) => f.meal === ml);
        if (!g.length) return null;
        return (
          <View key={ml}>
            <GroupHead left={cap1(ml)} right={`${n0(sum(g, (f) => f.kcal))} kcal`} />
            {g.map((f) => (
              <Row key={f.id} title={f.entry} sub={`${f.time} · ${f.src}`}
                right={<><T w="semibold">{Math.round(f.kcal)}</T><Del label={`Remove ${f.entry}`} onPress={() => { st.delFood(f.id); toast("Removed"); }} /></>} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

function Progress() {
  const st = useStore();
  const [range, setRange] = useState(14);
  const [cap, setCap] = useState<string | null>(null);
  const base = bmr(st.profile) * 1.2;
  const walkOn = (d: string) => sum(st.walks.filter((w) => w.date === d), (w) => w.kcal);
  const maintOn = (d: string) => base + walkOn(d);
  const eatenOn = (d: string) => sum(st.food.filter((f) => f.date === d), (f) => f.kcal);
  const days = rangeDays(range);
  const eaten = days.map(eatenOn), maint = days.map(maintOn);

  const done = days.slice(0, -1);
  const logged = done.map((d) => [eatenOn(d), maintOn(d)] as [number, number]).filter(([v]) => v > 0);
  const below = logged.filter(([v, mm]) => v <= mm).length;
  const net = sum(logged, ([v, mm]) => v - mm);
  const avgE = logged.length ? sum(logged, (x) => x[0]) / logged.length : 0;
  const avgM = logged.length ? sum(logged, (x) => x[1]) / logged.length : 0;

  return (
    <View>
      <Chips options={[[7, "7 days"], [14, "14 days"], [30, "30 days"]]} value={range} onPick={(v) => { setRange(v); setCap(null); }} />
      <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginHorizontal: 4, marginBottom: 8 }}>
          <T w="semibold">Eaten vs maintenance</T>
          <T c={C.muted} size={13}>{dShort(days[0])} – {dShort(days[days.length - 1])}</T>
        </View>
        <BarChart values={eaten} labels={days.map(dNum)} line={maint}
          colors={eaten.map((e, i) => (e <= maint[i] ? C.leaf : C.turmeric))} faded={[days.length - 1]}
          onTap={(i) => {
            const diff = eaten[i] - maint[i];
            setCap(`${dLong(days[i])} · ${n0(eaten[i])} eaten, ${n0(maint[i])} maintenance · ${diff > 0 ? "+" : "−"}${n0(Math.abs(diff))}${days[i] === st.todayISO ? " (today, still going)" : ""}`);
          }} />
        <Legend items={[[C.leaf, "Below maintenance"], [C.turmeric, "Above"], [C.ink, "Maintenance", true]]} />
        <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that day."}</T>
      </Panel>
      <Grid>
        <Tile k="Below maintenance" v={below} unit={`of ${logged.length} days`} />
        <Tile k="Average eaten" v={n0(avgE)} unit="kcal" />
        <Tile k="Average maintenance" v={n0(avgM)} unit="kcal" />
        <Tile k="Net for period" v={`${net > 0 ? "+" : net < 0 ? "−" : ""}${n0(Math.abs(net))}`} unit="kcal" />
      </Grid>
      <Note>
        {logged.length
          ? `Net ${net > 0 ? "+" : "−"}${n0(Math.abs(net))} kcal is roughly ${Math.abs(net) < 770 ? "less than 0.1 kg" : (Math.abs(net) / 7700).toFixed(1) + " kg"} of body weight ${net > 0 ? "gained" : "lost"} over these days, as a rough estimate. `
          : "Log food for a few days to see how you're doing. "}
        Maintenance is {n0(base)} kcal for daily life plus each day's walks. Days with nothing logged and today are left out of the numbers.
      </Note>
    </View>
  );
}
