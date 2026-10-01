import React, { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { Btn, Chips, Del, Note, Row, Sheet, SheetInput, SheetLabel, T, useToast } from "../components/ui";
import { exportBackup, importBackup, wipeAll } from "../lib/backup";
import { applyReminders, parseHM } from "../lib/reminders";
import type { Profile, Reminders, Sex } from "../lib/types";
import { n0 } from "../lib/util";
import { bmr, useStore } from "../store";
import { C } from "../theme";

const REM_LABEL: Record<keyof Reminders, string> = { walk: "Walk reminder", food: "Log food reminder", workout: "Workout reminder" };

export default function Settings({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const st = useStore(), toast = useToast();
  const [w, setW] = useState(""), [h, setH] = useState(""), [a, setA] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [rem, setRem] = useState<Reminders>(st.reminders);
  const [showFoods, setShowFoods] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setW(String(st.profile.weight)); setH(String(st.profile.height)); setA(String(st.profile.age));
    setSex(st.profile.sex); setRem(st.reminders); setShowFoods(false);
  }, [visible]);

  const save = async () => {
    const p: Profile = {
      weight: +w > 20 && +w < 400 ? +w : st.profile.weight,
      height: +h > 90 && +h < 250 ? +h : st.profile.height,
      age: +a > 5 && +a < 120 ? Math.round(+a) : st.profile.age,
      sex,
    };
    for (const k of Object.keys(rem) as (keyof Reminders)[]) {
      if (rem[k].on && !parseHM(rem[k].time)) { Alert.alert("Check the time", `${REM_LABEL[k]}: use a time like 06:30 or 21:00.`); return; }
    }
    st.saveProfile(p);
    st.saveReminders(rem);
    const err = await applyReminders(rem).catch((e) => String(e?.message ?? e));
    if (err) Alert.alert("Reminders", err);
    onClose();
    toast("Saved");
  };

  const preview = bmr({ weight: +w || st.profile.weight, height: +h || st.profile.height, age: +a || st.profile.age, sex }) * 1.2;
  const customs = Object.values(st.custom).sort((x, y) => x.name.localeCompare(y.name));

  return (
    <Sheet visible={visible} onClose={onClose}>
      <T w="bold" size={21} style={{ marginBottom: 4 }}>Your details</T>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><SheetLabel>Weight (kg)</SheetLabel><SheetInput value={w} onChangeText={setW} keyboardType="decimal-pad" /></View>
        <View style={{ flex: 1 }}><SheetLabel>Height (cm)</SheetLabel><SheetInput value={h} onChangeText={setH} keyboardType="decimal-pad" /></View>
        <View style={{ flex: 1 }}><SheetLabel>Age</SheetLabel><SheetInput value={a} onChangeText={setA} keyboardType="number-pad" /></View>
      </View>
      <SheetLabel>Sex (for the resting-calorie formula)</SheetLabel>
      <Chips options={[["male", "Male"], ["female", "Female"]]} value={sex} onPick={setSex} />
      <Note style={{ marginTop: 0 }}>
        Maintenance ≈ {n0(preview)} kcal: resting calories (Mifflin–St Jeor) × 1.2 for daily life, plus the calories from each day's walks. Real needs vary by a few hundred calories.
      </Note>

      <T w="bold" size={18} style={{ marginTop: 24 }}>Reminders</T>
      {(Object.keys(rem) as (keyof Reminders)[]).map((k) => (
        <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
          <Switch value={rem[k].on} onValueChange={(on) => setRem({ ...rem, [k]: { ...rem[k], on } })}
            trackColor={{ true: C.leaf, false: C.line }} thumbColor={C.surface} />
          <T style={{ flex: 1 }}>{REM_LABEL[k]}</T>
          <SheetInput value={rem[k].time} onChangeText={(time) => setRem({ ...rem, [k]: { ...rem[k], time } })}
            style={{ width: 90, textAlign: "center", paddingVertical: 8 }} placeholder="06:30" keyboardType="numbers-and-punctuation" />
        </View>
      ))}
      <Note>Daily, at the time shown (24-hour clock).</Note>

      <Btn kind="dark" label="Save" onPress={save} style={{ marginTop: 20, paddingVertical: 14 }} />

      <T w="bold" size={18} style={{ marginTop: 28 }}>Your saved foods</T>
      <Note style={{ marginTop: 4 }}>Calories you entered or picked from Open Food Facts. Delete one to look it up again.</Note>
      {customs.length === 0 ? <Note>None yet.</Note> : (
        <>
          {(showFoods ? customs : customs.slice(0, 4)).map((c) => (
            <Row key={c.name} title={c.name}
              sub={c.kcal100 != null ? `${c.kcal100} kcal / 100 g${c.serving_g ? ` · serving ${Math.round(c.serving_g)} g` : ""} · ${c.src}` : `${c.kcal_serving} kcal per serving · ${c.src}`}
              right={<Del label={`Delete ${c.name}`} onPress={() => st.delCustom(c.name)} />} />
          ))}
          {customs.length > 4 && !showFoods ? <Btn small kind="ghost" label={`Show all ${customs.length}`} onPress={() => setShowFoods(true)} style={{ alignSelf: "flex-start" }} /> : null}
        </>
      )}

      <T w="bold" size={18} style={{ marginTop: 28 }}>Your data</T>
      <Note style={{ marginTop: 4 }}>Everything is stored only on this phone. Back it up now and then, or before changing phones.</Note>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <Btn small kind="ghost" label="Back up to a file" onPress={() => exportBackup().catch((e) => Alert.alert("Backup failed", String(e?.message ?? e)))} />
        <Btn small kind="ghost" label="Restore from a file" onPress={() =>
          Alert.alert("Restore a backup?", "This replaces everything in the app with the backup's contents.", [
            { text: "Cancel", style: "cancel" },
            { text: "Choose file", onPress: async () => {
              try { const m = await importBackup(); if (m) { st.reload(); toast(m); onClose(); } }
              catch (e: any) { Alert.alert("Restore failed", e?.message ?? String(e)); }
            } },
          ])} />
        <Btn small kind="stop" label="Delete all data" onPress={() =>
          Alert.alert("Delete everything?", "All walks, food, workouts and plans will be erased. This can't be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete all", style: "destructive", onPress: () => { wipeAll(); st.reload(); toast("All data deleted"); onClose(); } },
          ])} />
      </View>
      <Note style={{ marginTop: 22 }}>FitFaaz · map data © OpenStreetMap contributors · food search by Open Food Facts</Note>
    </Sheet>
  );
}
