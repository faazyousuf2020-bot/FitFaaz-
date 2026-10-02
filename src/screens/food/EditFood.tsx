import React, { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { macroLine } from "../../components/MacroBars";
import { Btn, Chips, Note, Sheet, SheetInput, SheetLabel, T, useToast } from "../../components/ui";
import { MEALS } from "../../lib/food";
import { calcItem, parseItem, portionText } from "../../lib/foodEngine";
import type { Food } from "../../lib/types";
import { cap1 } from "../../lib/util";
import { useStore } from "../../store";
import { C } from "../../theme";

const fmt = (n: number | null | undefined) => (n == null ? "" : String(Math.round(n * 10) / 10));

/** Change an entry's amount, calories or macros. */
export default function EditFood({ entry, onClose }: { entry: Food | null; onClose: () => void }) {
  const st = useStore(), toast = useToast();
  const [text, setText] = useState("");
  const [kcal, setKcal] = useState(""), [p, setP] = useState(""), [c, setC] = useState(""), [f, setF] = useState("");
  const [meal, setMeal] = useState("breakfast");
  const [remember, setRemember] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!entry) return;
    setText(entry.entry); setKcal(fmt(entry.kcal)); setP(fmt(entry.p)); setC(fmt(entry.c)); setF(fmt(entry.f));
    setMeal(entry.meal); setRemember(false); setNote("");
  }, [entry?.id]);

  // changing the amount recalculates everything
  const onText = (t: string) => {
    setText(t);
    const it = calcItem(t, st.custom);
    if (it.how === "unknown") { setNote("Not recognised — the numbers below stay as they are."); return; }
    setKcal(fmt(it.kcal)); setP(fmt(it.p)); setC(fmt(it.c)); setF(fmt(it.f));
    setNote(`${it.label} · ${portionText(it)}`);
  };

  const save = () => {
    if (!entry) return;
    const k = +kcal;
    if (!(k >= 0)) return;
    const num = (s: string) => (s.trim() && !isNaN(+s) ? +s : null);
    const it = calcItem(text, st.custom);
    st.updateFood(entry.id, {
      entry: text.trim() || entry.entry, kcal: k, p: num(p), c: num(c), f: num(f), meal,
      fib: it.how !== "unknown" ? it.fib : entry.fib, grams: it.how !== "unknown" ? it.grams : entry.grams,
      src: "your value", est: num(p) == null ? 1 : 0,
    });
    if (remember) {
      const parsed = parseItem(text, st.custom);
      const q = Math.max(0.01, parsed.q * parsed.size);
      const name = parsed.food || text.trim().toLowerCase();
      st.saveCustom({
        name, kcal_serving: k / q, kcal100: null, serving_g: it.grams ? it.grams / q : null, src: "your value",
        p: num(p) != null ? num(p)! / q : null, c: num(c) != null ? num(c)! / q : null, f: num(f) != null ? num(f)! / q : null,
        fib: null, barcode: null,
      });
    }
    toast("Saved");
    onClose();
  };

  const name = entry ? parseItem(text, st.custom).food : "";
  return (
    <Sheet visible={!!entry} onClose={onClose}>
      {entry ? (
        <View>
          <T w="bold" size={20}>Edit entry</T>
          <SheetLabel>What and how much</SheetLabel>
          <SheetInput value={text} onChangeText={onText} autoCapitalize="none" autoCorrect={false} />
          {note ? <Note style={{ marginTop: 6 }}>{note}</Note> : null}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1.3 }}><SheetLabel>Calories</SheetLabel><SheetInput value={kcal} onChangeText={setKcal} keyboardType="decimal-pad" /></View>
            <View style={{ flex: 1 }}><SheetLabel>Protein g</SheetLabel><SheetInput value={p} onChangeText={setP} keyboardType="decimal-pad" /></View>
            <View style={{ flex: 1 }}><SheetLabel>Carbs g</SheetLabel><SheetInput value={c} onChangeText={setC} keyboardType="decimal-pad" /></View>
            <View style={{ flex: 1 }}><SheetLabel>Fat g</SheetLabel><SheetInput value={f} onChangeText={setF} keyboardType="decimal-pad" /></View>
          </View>
          {entry.est ? <Note>Macros on this entry were estimated. Type exact numbers if you have them.</Note> : null}
          <SheetLabel>Meal</SheetLabel>
          <Chips options={MEALS.map((m) => [m, cap1(m)] as [string, string])} value={meal} onPick={setMeal} />
          {name ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
              <Switch value={remember} onValueChange={setRemember} trackColor={{ true: C.leaf, false: C.line }} thumbColor={C.surface} />
              <T size={14} style={{ flex: 1 }}>Use these values next time for "{name}"</T>
            </View>
          ) : null}
          <Btn kind="dark" label="Save" onPress={save} style={{ marginTop: 18, paddingVertical: 14 }} />
          <Btn kind="stop" label="Delete entry" style={{ marginTop: 10 }} onPress={() =>
            Alert.alert("Delete this entry?", `${entry.entry} · ${Math.round(entry.kcal)} kcal`, [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => { st.delFood(entry.id); toast("Removed"); onClose(); } },
            ])} />
          <Note style={{ marginTop: 12 }}>Now: {Math.round(+kcal || 0)} kcal · {macroLine({ p: +p || 0, c: +c || 0, f: +f || 0 })}</Note>
        </View>
      ) : null}
    </Sheet>
  );
}
