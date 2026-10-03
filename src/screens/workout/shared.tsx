import React, { useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Btn, Chips, Field, Note, Sheet, SheetInput, SheetLabel, T, useToast } from "../../components/ui";
import { categoryOf, exKey, INTENSITY } from "../../lib/categories";
import type { Exercise } from "../../lib/types";
import { parseWo, validEx, woDesc } from "../../lib/workout";
import { useStore } from "../../store";
import { C } from "../../theme";

export function useKnownNames() {
  const st = useStore();
  return useMemo(() => [...new Map([...st.workouts, ...st.plan].map((w) => [exKey(w.name), w.name])).values()], [st.workouts, st.plan]);
}
export function useCatOf() {
  const st = useStore();
  return (name: string, kg = 0) => categoryOf(name, st.meta, kg);
}
export function useCatName() {
  const st = useStore();
  return (id: string | null) => (id ? st.categories.find((c) => c.id === id)?.name ?? "Other" : "Other");
}

export const Tags = ({ p }: { p: Exercise }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
    {[p.name, ...woDesc(p), ...(p.sets > 1 && p.reps ? [`${p.sets * p.reps} total`] : [])].map((t, i) => (
      <View key={i} style={{ backgroundColor: C.leafSoft, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 8 }}>
        <T w="semibold" size={13} c={C.tealText}>{t}</T>
      </View>
    ))}
  </View>
);

/** Type an exercise; asks once for a category when the exercise isn't recognised. */
export function ExerciseInput({ placeholder, button, onAdd, hint }: {
  placeholder: string; button: string; onAdd: (e: Exercise) => void; hint: string;
}) {
  const st = useStore();
  const known = useKnownNames();
  const catOf = useCatOf();
  const [text, setText] = useState("");
  const [newCat, setNewCat] = useState(false);
  const p = text.trim() ? parseWo(text, known) : null;
  const ok = !!p && validEx(p);
  const needsCat = ok && !catOf(p!.name, p!.kg) && !/^walk/i.test(p!.name);
  const submit = () => { if (p && ok && !needsCat) { onAdd(p); setText(""); } };
  return (
    <View>
      <Field value={text} onChangeText={setText} placeholder={placeholder} button={button} disabled={!ok || needsCat} onSubmit={submit}
        autoCorrect={false} autoCapitalize="none" />
      <View style={{ minHeight: 22, paddingTop: 8, paddingHorizontal: 6 }}>
        {p ? ok ? <Tags p={p} /> : <T c={C.muted} size={14}>{hint}</T> : null}
        {needsCat ? (
          <View style={{ marginTop: 10 }}>
            <T size={14} w="semibold">Which category is "{p!.name}"?</T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {st.categories.map((c) => (
                <Pressable key={c.id} onPress={() => st.setExerciseCat(p!.name, c.id)}
                  style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: C.ink }}>
                  <T size={14} c={C.surface}>{c.name}</T>
                </Pressable>
              ))}
              <Pressable onPress={() => setNewCat(true)}
                style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: C.line }}>
                <T size={14}>+ New category</T>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
      <NewCategorySheet visible={newCat} onClose={() => setNewCat(false)} onCreated={(id) => { if (p) st.setExerciseCat(p.name, id); }} />
    </View>
  );
}

export function NewCategorySheet({ visible, onClose, onCreated, edit }: {
  visible: boolean; onClose: () => void; onCreated?: (id: string) => void; edit?: { id: string; name: string; met: number } | null;
}) {
  const st = useStore(), toast = useToast();
  const [name, setName] = useState("");
  const [met, setMet] = useState(5);
  React.useEffect(() => {
    if (visible) { setName(edit?.name ?? ""); setMet(edit?.met ?? 5); }
  }, [visible]);
  const save = () => {
    if (!name.trim()) return;
    if (edit) { st.updateCategory(edit.id, name, met); toast("Category saved"); }
    else { const id = st.addCategory(name, met); onCreated?.(id); toast(`Added "${name.trim()}"`); }
    onClose();
  };
  return (
    <Sheet visible={visible} onClose={onClose}>
      <T w="bold" size={20}>{edit ? "Edit category" : "New category"}</T>
      <SheetLabel>Name</SheetLabel>
      <SheetInput value={name} onChangeText={setName} placeholder="e.g. Core, Leg day, Morning routine" />
      <SheetLabel>How hard is it? (used for calories)</SheetLabel>
      <Chips options={INTENSITY.map(([l, m]) => [m, l] as [number, string])} value={INTENSITY.some(([, m]) => m === met) ? met : 5} onPick={setMet} />
      <Btn kind="dark" label="Save" onPress={save} disabled={!name.trim()} style={{ marginTop: 10, paddingVertical: 14 }} />
    </Sheet>
  );
}

/** Long-press an exercise to move it to another category. */
export function CategoryPicker({ name, onClose }: { name: string | null; onClose: () => void }) {
  const st = useStore(), toast = useToast(), catOf = useCatOf();
  const [newCat, setNewCat] = useState(false);
  const cur = name ? catOf(name) : null;
  return (
    <>
      <Sheet visible={!!name && !newCat} onClose={onClose}>
        <T w="bold" size={20}>Category for "{name}"</T>
        <View style={{ marginTop: 12, gap: 6 }}>
          {st.categories.map((c) => (
            <Pressable key={c.id} onPress={() => { st.setExerciseCat(name!, c.id); toast(`Moved to ${c.name}`); onClose(); }}
              style={{ flexDirection: "row", justifyContent: "space-between", padding: 14, borderRadius: 12, backgroundColor: c.id === cur ? C.leafSoft : C.bg }}>
              <T w={c.id === cur ? "semibold" : "regular"}>{c.name}</T>
              {c.id === cur ? <T c={C.tealText} w="semibold">✓</T> : null}
            </Pressable>
          ))}
          <Pressable onPress={() => setNewCat(true)} style={{ padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, borderStyle: "dashed" }}>
            <T>+ New category</T>
          </Pressable>
        </View>
      </Sheet>
      <NewCategorySheet visible={newCat} onClose={() => { setNewCat(false); onClose(); }}
        onCreated={(id) => { if (name) st.setExerciseCat(name, id); }} />
    </>
  );
}

/** Rename, re-rate or delete your own categories. */
export function ManageCategories({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const st = useStore();
  const [edit, setEdit] = useState<{ id: string; name: string; met: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const label = (met: number) => INTENSITY.find(([, m]) => m === met)?.[0] ?? `${met} MET`;
  return (
    <>
      <Sheet visible={visible && !edit && !creating} onClose={onClose}>
        <T w="bold" size={20}>Categories</T>
        <Note style={{ marginTop: 4 }}>Long-press any exercise to move it to another category.</Note>
        <View style={{ marginTop: 12, gap: 6 }}>
          {st.categories.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, backgroundColor: C.bg, gap: 8 }}>
              <View style={{ flex: 1 }}>
                <T w="semibold">{c.name}</T>
                <T c={C.muted} size={13}>{c.builtin ? "Built in" : label(c.met)}</T>
              </View>
              {!c.builtin ? (
                <>
                  <Btn small kind="ghost" label="Edit" onPress={() => setEdit({ id: c.id, name: c.name, met: c.met })} />
                  <Btn small kind="stop" label="Delete" onPress={() =>
                    Alert.alert(`Delete "${c.name}"?`, "Its exercises go back to their automatic category.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => st.deleteCategory(c.id) },
                    ])} />
                </>
              ) : null}
            </View>
          ))}
        </View>
        <Btn kind="dark" label="+ New category" onPress={() => setCreating(true)} style={{ marginTop: 14, paddingVertical: 14 }} />
      </Sheet>
      <NewCategorySheet visible={!!edit || creating} edit={edit} onClose={() => { setEdit(null); setCreating(false); }} />
    </>
  );
}
