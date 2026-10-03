import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Switch, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { BarChart, Legend } from "../components/charts";
import { MACRO_COLORS, macroLine } from "../components/MacroBars";
import { Btn, Chips, Del, Empty, Field, Grid, GroupHead, Note, Panel, Row, Seg, T, Tile, useToast } from "../components/ui";
import { dayWorkout } from "../lib/burn";
import { MEALS, mealNow, OnlineFood, searchOFF } from "../lib/food";
import { calcAll, Item, norm, portionText, SIZES } from "../lib/foodEngine";
import { foodOn } from "../lib/stats";
import type { Food as FoodT } from "../lib/types";
import { cap1, dayISO, dLong, dNum, dShort, n0, rangeDays, sum } from "../lib/util";
import { bmr, useStore } from "../store";
import { C } from "../theme";
import BarcodeScanner from "./food/BarcodeScanner";
import EditFood from "./food/EditFood";

export default function Food({ pane, setPane }: { pane: string; setPane: (p: string) => void }) {
  return (
    <View>
      <Seg options={[["log", "Log"], ["progress", "Progress"]]} value={pane} onPick={setPane} />
      {pane === "log" ? <Log /> : <Progress />}
    </View>
  );
}

/* ================= log ================= */
function Log() {
  const st = useStore(), toast = useToast();
  const [text, setText] = useState("");
  const [sizes, setSizes] = useState<Record<number, number>>({});
  const [meal, setMeal] = useState<string | null>(null);
  const [scan, setScan] = useState(false);
  const [editing, setEditing] = useState<FoodT | null>(null);
  const curMeal = meal ?? mealNow();

  const items = useMemo(() => (text.trim() ? calcAll(text, st.custom, sizes) : []), [text, st.custom, sizes]);
  const unknown = items.filter((i) => i.how === "unknown");
  const canAdd = items.length > 0 && !unknown.length;
  const total = sum(items, (i) => i.kcal);

  const onText = (t: string) => { setText(t); setSizes({}); };
  const add = () => {
    if (!canAdd) return;
    for (const it of items) st.addFood(it.raw, it, curMeal);
    toast(items.length > 1 ? `Added ${items.length} items · ${Math.round(total)} kcal` : `Added · ${Math.round(total)} kcal`);
    setText(""); setSizes({});
  };

  // frequent foods: logged at least twice in the last 30 days, sorted for the chosen meal
  const frequent = useMemo(() => {
    const from = dayISO(29);
    const groups = new Map<string, { last: FoodT; n: number; inMeal: number }>();
    for (const f of st.food) {
      if (f.date < from) continue;
      const k = norm(f.entry);
      const g = groups.get(k) ?? { last: f, n: 0, inMeal: 0 };
      g.n++; if (f.meal === curMeal) g.inMeal++;
      g.last = f;
      groups.set(k, g);
    }
    return [...groups.values()].filter((g) => g.n >= 2)
      .sort((a, b) => b.inMeal * 2 + b.n - (a.inMeal * 2 + a.n))
      .slice(0, 8).map((g) => g.last);
  }, [st.food, curMeal]);

  const todays = st.food.filter((f) => f.date === st.todayISO);
  const tot = foodOn(st.food, st.todayISO);

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Field value={text} onChangeText={onText} placeholder="2 idli, 1 cup sambar" button="Add"
            disabled={!canAdd} onSubmit={add} autoCorrect={false} autoCapitalize="none" />
        </View>
        <Pressable onPress={() => setScan(true)} accessibilityLabel="Scan a barcode"
          style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, alignItems: "center", justifyContent: "center" }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
            <Path d="M8 8v8M11 8v8M14 8v8M17 8v8" />
          </Svg>
        </Pressable>
      </View>

      {items.length ? (
        <View style={{ marginTop: 10 }}>
          {items.map((it, i) => it.how === "unknown"
            ? <UnknownItem key={i + it.food} item={it} />
            : <ItemPreview key={i + it.raw} item={it} size={sizes[i] ?? it.size} onSize={(m) => setSizes({ ...sizes, [i]: m })} />)}
          {items.length > 1 && canAdd ? (
            <T c={C.muted} size={14} style={{ marginHorizontal: 4, marginTop: 2 }}>
              Total <T w="semibold" size={14}>{Math.round(total)} kcal</T> · {macroLine({ p: sum(items, (i) => i.p), c: sum(items, (i) => i.c), f: sum(items, (i) => i.f) })}
            </T>
          ) : null}
        </View>
      ) : null}

      <Chips style={{ marginTop: 12 }} options={MEALS.map((x) => [x, cap1(x)] as [string, string])} value={curMeal} onPick={setMeal} />

      {!text && frequent.length ? (
        <View>
          <T c={C.muted} size={13} style={{ marginHorizontal: 4, marginBottom: 6 }}>Your usual {curMeal}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {frequent.map((f) => (
              <Pressable key={f.id} onPress={() => {
                st.addFood(f.entry, { kcal: f.kcal, p: f.p ?? 0, c: f.c ?? 0, f: f.f ?? 0, fib: f.fib ?? 0, grams: f.grams, src: f.src, est: !!f.est }, curMeal);
                toast(`Added · ${Math.round(f.kcal)} kcal`);
              }}
                style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface }}>
                <T size={14}>{f.entry} · {Math.round(f.kcal)}</T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <GroupHead left="Today" right={`${n0(tot.kcal)} kcal`} style={{ marginTop: 22 }} />
      {todays.length ? <T c={C.muted} size={13} style={{ marginHorizontal: 4, marginTop: -4, marginBottom: 4 }}>{macroLine(tot)}</T> : null}
      {!todays.length ? <Empty>Nothing logged today. Type what you ate above, or scan a packet.</Empty> : MEALS.map((ml) => {
        const g = todays.filter((f) => f.meal === ml);
        if (!g.length) return null;
        // identical items in a meal become one row: "Banana 30gm ×3"
        const groups: FoodT[][] = [];
        for (const f of g) {
          const hit = groups.find((x) => norm(x[0].entry) === norm(f.entry) && Math.round(x[0].kcal) === Math.round(f.kcal));
          hit ? hit.push(f) : groups.push([f]);
        }
        return (
          <View key={ml}>
            <GroupHead left={cap1(ml)} right={`${n0(sum(g, (f) => f.kcal))} kcal`} />
            {groups.map((grp) => {
              const f = grp[grp.length - 1], n = grp.length;
              return (
                <Row key={f.id} onPress={() => setEditing(f)}
                  title={n > 1 ? `${f.entry} ×${n}` : f.entry}
                  sub={`${f.time} · ${macroLine({ p: sum(grp, (x) => x.p ?? 0), c: sum(grp, (x) => x.c ?? 0), f: sum(grp, (x) => x.f ?? 0) })}${f.est ? " · est." : ""}`}
                  right={<><T w="semibold">{Math.round(sum(grp, (x) => x.kcal))}</T>
                    <Del label={`Remove one ${f.entry}`} onPress={() => { st.delFood(f.id); toast(n > 1 ? `Removed one · ${n - 1} left` : "Removed"); }} /></>} />
              );
            })}
          </View>
        );
      })}
      {todays.length ? <Note>Tap an entry to change the amount, calories or macros.</Note> : null}

      <BarcodeScanner visible={scan} onClose={() => setScan(false)} meal={curMeal} />
      <EditFood entry={editing} onClose={() => setEditing(null)} />
    </View>
  );
}

function ItemPreview({ item, size, onSize }: { item: Item; size: number; onSize: (m: number) => void }) {
  return (
    <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <T w="semibold">{cap1(item.label)}</T>
          <T c={C.muted} size={13}>
            {portionText(item)}{item.how === "fuzzy" ? ` · closest match for "${item.food}"` : ""}
          </T>
          <T c={C.muted} size={13}>{macroLine(item)}{item.est ? " · est." : ""} · {item.src}</T>
        </View>
        <T w="bold" size={18}>{Math.round(item.kcal)}<T size={12} c={C.muted}> kcal</T></T>
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
        {SIZES.map(([l, m]) => {
          const on = Math.abs(size - m) < 0.01;
          return (
            <Pressable key={l} onPress={() => onSize(m)}
              style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? C.ink : C.sunk }}>
              <T size={13} c={on ? C.surface : C.muted}>{l}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function UnknownItem({ item }: { item: Item }) {
  const st = useStore(), toast = useToast();
  const [results, setResults] = useState<OnlineFood[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [kcal, setKcal] = useState("");
  const [withMacros, setWithMacros] = useState(false);
  const [p, setP] = useState(""), [c, setC] = useState(""), [f, setF] = useState("");
  const food = item.food;

  useEffect(() => {
    setResults(null); setFailed(false);
    if (!food || food.length < 3) return;
    const ctl = new AbortController();
    const h = setTimeout(async () => {
      setLoading(true);
      try { setResults(await searchOFF(food, ctl.signal)); }
      catch { if (!ctl.signal.aborted) setFailed(true); }
      finally { if (!ctl.signal.aborted) setLoading(false); }
    }, 600);
    return () => { clearTimeout(h); ctl.abort(); setLoading(false); };
  }, [food]);

  const name = norm(food);
  const useOnline = (o: OnlineFood) => {
    st.saveCustom({ name, kcal_serving: null, kcal100: o.kcal100, serving_g: o.serving_g, src: "online", p: o.p, c: o.c, f: o.f, fib: o.fib, barcode: o.barcode ?? null });
    toast(`Saved "${name}"`);
  };
  const saveManual = () => {
    const k = +kcal;
    if (!(k > 0)) return;
    const num = (s: string) => (withMacros && s.trim() && !isNaN(+s) ? +s : null);
    st.saveCustom({ name, kcal_serving: k, kcal100: null, serving_g: null, src: "your value", p: num(p), c: num(c), f: num(f), fib: null, barcode: null });
    toast(`Saved "${name}"`);
  };

  return (
    <View style={{ backgroundColor: C.turmericSoft, borderRadius: 14, padding: 12, marginBottom: 6 }}>
      <T w="semibold" c={C.turmericInk}>"{food}" isn't in the food list</T>
      <T size={13} c={C.turmericInk} style={{ marginTop: 2 }}>Pick an online match, or type calories for one {item.unit || "serving"}. FitFaaz remembers it after this.</T>
      <View style={{ marginTop: 8 }}>
        {loading ? <View style={{ flexDirection: "row", gap: 8, padding: 6 }}><ActivityIndicator color={C.leaf} /><T c={C.muted} size={14}>Searching online…</T></View> : null}
        {failed ? <Note style={{ marginTop: 0 }}>Couldn't search online. Check your internet, or enter calories below.</Note> : null}
        {results && !results.length ? <Note style={{ marginTop: 0 }}>No online match.</Note> : null}
        {results?.map((o) => (
          <Row key={o.name} onPress={() => useOnline(o)} title={o.name}
            sub={`${o.kcal100} kcal / 100 g${o.p != null ? ` · ${macroLine(o)}` : ""}${o.serving_g ? ` · serving ${Math.round(o.serving_g)} g` : ""}`}
            right={<T w="semibold" c={C.tealText} size={14}>Use</T>} />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Field value={kcal} onChangeText={setKcal} placeholder={`kcal per ${item.unit || "serving"}`} keyboardType="decimal-pad"
            button="Save" disabled={!(+kcal > 0)} onSubmit={saveManual} />
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
        <Switch value={withMacros} onValueChange={setWithMacros} trackColor={{ true: C.leaf, false: C.line }} thumbColor={C.surface} />
        <T size={13} c={C.turmericInk}>{withMacros ? "Protein, carbs, fat per serving (g)" : "Add protein, carbs, fat myself (otherwise estimated)"}</T>
      </View>
      {withMacros ? (
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          {[[p, setP, "Protein"], [c, setC, "Carbs"], [f, setF, "Fat"]].map(([v, set, ph]) => (
            <View key={ph as string} style={{ flex: 1 }}>
              <Field value={v as string} onChangeText={set as (s: string) => void} placeholder={ph as string} keyboardType="decimal-pad" />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ================= progress ================= */
type Metric = "kcal" | "p" | "c" | "f";
function Progress() {
  const st = useStore();
  const [range, setRange] = useState(14);
  const [metric, setMetric] = useState<Metric>("kcal");
  const [cap, setCap] = useState<string | null>(null);
  const base = bmr(st.profile) * 1.2;
  const maintOn = (d: string) =>
    base + sum(st.walks.filter((w) => w.date === d), (w) => w.kcal)
    + dayWorkout(d, st.workouts, st.sessions, st.categories, st.meta, st.profile.weight).kcal;
  const days = rangeDays(range);
  const totals = days.map((d) => foodOn(st.food, d));
  const vals = totals.map((t) => t[metric]);
  const target = metric === "kcal" ? days.map(maintOn) : days.map(() => st.targets[metric]);
  const unit = metric === "kcal" ? "kcal" : "g";
  const NAMES: Record<Metric, string> = { kcal: "Calories", p: "Protein", c: "Carbs", f: "Fat" };

  const doneIdx = days.map((_, i) => i).filter((i) => i < days.length - 1 && totals[i].kcal > 0);
  const avg = (arr: number[]) => (arr.length ? sum(arr, (x) => x) / arr.length : 0);
  const avgVal = avg(doneIdx.map((i) => vals[i])), avgTarget = avg(doneIdx.map((i) => target[i]));
  const net = sum(doneIdx, (i) => totals[i].kcal - target[i]);
  const hit = doneIdx.filter((i) => (metric === "kcal" ? vals[i] <= target[i] : vals[i] >= target[i] * 0.9)).length;

  const color = metric === "kcal" ? null : MACRO_COLORS[metric];
  return (
    <View>
      <Chips options={[["kcal", "Calories"], ["p", "Protein"], ["c", "Carbs"], ["f", "Fat"]]} value={metric} onPick={(v) => { setMetric(v as Metric); setCap(null); }} />
      <Chips options={[[7, "7 days"], [14, "14 days"], [30, "30 days"]]} value={range} onPick={(v) => { setRange(v); setCap(null); }} />
      <Panel style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginHorizontal: 4, marginBottom: 8 }}>
          <T w="semibold">{metric === "kcal" ? "Eaten vs maintenance" : `${NAMES[metric]} vs target`}</T>
          <T c={C.muted} size={13}>{dShort(days[0])} – {dShort(days[days.length - 1])}</T>
        </View>
        <BarChart values={vals} labels={days.map(dNum)} line={target}
          colors={vals.map((v, i) => color ?? (v <= target[i] ? C.leaf : C.danger))} faded={[days.length - 1]}
          onTap={(i) => {
            const t = totals[i];
            setCap(`${dLong(days[i])} · ${n0(t.kcal)} kcal · ${macroLine(t)}${metric === "kcal" ? ` · maintenance ${n0(target[i])}` : ` · target ${n0(target[i])} g`}${days[i] === st.todayISO ? " (today, still going)" : ""}`);
          }} />
        <Legend items={metric === "kcal"
          ? [[C.leaf, "Below maintenance"], [C.danger, "Above"], [C.ink, "Maintenance", true]]
          : [[color!, NAMES[metric]], [C.ink, "Daily target", true]]} />
        <T c={C.muted} size={14} style={{ marginTop: 8, marginHorizontal: 4 }}>{cap ?? "Tap a bar for that day."}</T>
      </Panel>
      <Grid>
        <Tile k={`Average ${NAMES[metric].toLowerCase()}`} v={n0(avgVal)} unit={unit} />
        <Tile k={metric === "kcal" ? "Average maintenance" : "Daily target"} v={n0(avgTarget)} unit={unit} />
        <Tile k={metric === "kcal" ? "Below maintenance" : "Days near target"} v={hit} unit={`of ${doneIdx.length} days`} />
        {metric === "kcal"
          ? <Tile k="Net for period" v={`${net > 0 ? "+" : net < 0 ? "−" : ""}${n0(Math.abs(net))}`} unit="kcal" />
          : <Tile k="Share of calories" v={`${Math.round(avg(doneIdx.map((i) => (totals[i].kcal ? (vals[i] * (metric === "f" ? 9 : 4)) / totals[i].kcal : 0))) * 100)}%`} />}
      </Grid>
      <Note>
        {metric === "kcal"
          ? doneIdx.length
            ? `Net ${net > 0 ? "+" : "−"}${n0(Math.abs(net))} kcal is roughly ${Math.abs(net) < 770 ? "less than 0.1 kg" : (Math.abs(net) / 7700).toFixed(1) + " kg"} of body weight ${net > 0 ? "gained" : "lost"} over these days, as a rough estimate. Maintenance is ${n0(base)} kcal for daily life plus each day's walks and workouts.`
            : "Log food for a few days to see how you're doing."
          : `Targets are set under the profile icon. Home-cooked macros are estimates; protein is usually the most reliable.`}
        {" "}Days with nothing logged and today are left out of the averages.
      </Note>
    </View>
  );
}
