import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Btn, Meter, Panel, Rest, T, useToast } from "../../components/ui";
import { categoryOf } from "../../lib/categories";
import type { PlanItem } from "../../lib/types";
import { addDays, dLong, dMed, dShort, dWd, dWdLong, weekStart } from "../../lib/util";
import { isWalk } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";
import { PlanRow, usePlanStatus } from "../PlanRows";
import { CategoryPicker, ExerciseInput, ManageCategories, useCatName } from "./shared";

export default function Plan({ go }: { go: (t: string, p?: string) => void }) {
  const st = useStore(), toast = useToast(), status = usePlanStatus(), catName = useCatName();
  const TODAY = st.todayISO, thisWs = weekStart(TODAY);
  const [ws, setWs] = useState(thisWs);
  const [open, setOpen] = useState<Set<string>>(new Set([TODAY]));
  const [showPast, setShowPast] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const [manage, setManage] = useState(false);

  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const isThisWeek = ws === thisWs;
  const pastDays = isThisWeek ? days.filter((d) => d < TODAY) : [];
  const shown = isThisWeek && !showPast ? days.filter((d) => d >= TODAY) : days;
  const title = isThisWeek ? "This week" : ws === addDays(thisWs, 7) ? "Next week" : ws < thisWs ? "Past week" : "Upcoming week";

  const upcoming = days.filter((d) => d >= TODAY || !isThisWeek);
  const all = upcoming.flatMap((d) => st.plan.filter((p) => p.date === d).map((it) => status(d, it)));
  const done = all.filter((s) => s === "done").length;
  const toggle = (d: string) => setOpen((o) => { const n = new Set(o); n.has(d) ? n.delete(d) : n.add(d); return n; });

  const groupByCat = (items: PlanItem[]) => {
    const m = new Map<string, PlanItem[]>();
    for (const it of items) {
      const c = isWalk(it.name) ? "walk" : categoryOf(it.name, st.meta, it.kg) ?? "other";
      m.set(c, [...(m.get(c) ?? []), it]);
    }
    const order = ["walk", ...st.categories.map((c) => c.id), "other"];
    return order.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as [string, PlanItem[]]);
  };

  const renderDay = (d: string) => {
    const list = st.plan.filter((p) => p.date === d);
    const rest = st.restDays.has(d);
    const isOpen = open.has(d);
    const nDone = list.filter((it) => status(d, it) === "done").length;
    const summary = rest ? "Rest day" : list.length ? `${list.length} exercise${list.length === 1 ? "" : "s"}${nDone ? ` · ${nDone} done` : ""}` : "Nothing planned";
    return (
      <View style={{ marginBottom: 8 }}>
        <Pressable onPress={() => toggle(d)} style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, paddingHorizontal: 14,
          backgroundColor: isOpen ? C.surface : "transparent", borderRadius: 14, borderWidth: 1, borderColor: isOpen ? C.line : C.line,
        }}>
          <View>
            <T w="semibold" size={15} c={d === TODAY ? C.leaf : C.ink}>{d === TODAY ? `Today · ${dMed(d)}` : dLong(d)}</T>
            <T c={C.muted} size={13}>{summary}</T>
          </View>
          <T c={C.muted} size={18}>{isOpen ? "▾" : "▸"}</T>
        </Pressable>
        {isOpen ? (
          <View style={{ paddingTop: 8, paddingHorizontal: 2 }}>
            {rest ? <Rest>Rest day</Rest> : list.length ? groupByCat(list).map(([c, items]) => (
              <View key={c}>
                <T w="semibold" size={12} c={C.leaf} style={{ marginBottom: 6, marginTop: 4, marginHorizontal: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {c === "walk" ? "Walk" : catName(c === "other" ? null : c)}
                </T>
                {items.map((it) => <PlanRow key={it.id} item={it} withLog={false} onGoWalk={() => go("walk", "track")}
                  onLongPress={isWalk(it.name) ? undefined : () => setMoving(it.name)} />)}
              </View>
            )) : null}
            {!rest ? (
              <View style={{ marginTop: 6 }}>
                <ExerciseInput placeholder={`Add to ${dWd(d)}: pushups 3x15, walk 30 min`} button="Add"
                  hint="Add reps or time, like squats 3x20 or walk 30 min"
                  onAdd={(e) => { st.addPlan(d, e); toast(`Added to ${dWdLong(d)}`); }} />
              </View>
            ) : null}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              <Btn small kind="ghost" label={rest ? "Not a rest day" : "Make it a rest day"} onPress={() => st.toggleRest(d)} />
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Pressable onPress={() => { setWs(addDays(ws, -7)); setShowPast(false); }} style={navBtn}><T size={20}>‹</T></Pressable>
        <View style={{ alignItems: "center" }}>
          <T w="semibold" size={16}>{title}</T>
          <T c={C.muted} size={13}>{dShort(days[0])} – {dShort(days[6])}</T>
        </View>
        <Pressable onPress={() => { setWs(addDays(ws, 7)); setShowPast(false); }} style={navBtn}><T size={20}>›</T></Pressable>
      </View>
      <Panel style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <T size={14}>{all.length ? `${done} of ${all.length} planned done${isThisWeek ? " (today onwards)" : ""}` : "Nothing planned yet"}</T>
          <T w="semibold" size={14}>{all.length ? `${Math.round((done / all.length) * 100)}%` : ""}</T>
        </View>
        <Meter frac={all.length ? done / all.length : 0} height={8} />
      </Panel>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 14 }}>
        <Btn small kind="ghost" label="Copy week to next week" onPress={() => {
          st.copyWeek(ws); setWs(addDays(ws, 7)); setOpen(new Set([addDays(ws, 7)])); toast("Copied to next week");
        }} />
        <Btn small kind="ghost" label="Categories" onPress={() => setManage(true)} />
      </View>

      {shown.map((d) => <React.Fragment key={d}>{renderDay(d)}</React.Fragment>)}

      {pastDays.length ? (
        <Pressable onPress={() => setShowPast(!showPast)} style={{ alignItems: "center", paddingVertical: 12 }}>
          <T c={C.leaf} w="semibold" size={14}>{showPast ? "Hide past days" : `Show past days (${pastDays.length})`}</T>
        </Pressable>
      ) : null}
      <T c={C.muted} size={13} style={{ marginTop: 4, marginHorizontal: 4 }}>Long-press an exercise to change its category.</T>

      <CategoryPicker name={moving} onClose={() => setMoving(null)} />
      <ManageCategories visible={manage} onClose={() => setManage(false)} />
    </View>
  );
}

const navBtn = {
  width: 40, height: 40, borderRadius: 12, alignItems: "center" as const, justifyContent: "center" as const,
  backgroundColor: C.surface, borderWidth: 1, borderColor: C.line,
};
