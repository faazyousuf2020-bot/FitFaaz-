import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { macroLine } from "../../components/MacroBars";
import { Btn, Chips, Note, Sheet, SheetInput, SheetLabel, T, useToast } from "../../components/ui";
import { fetchBarcode, OnlineFood } from "../../lib/food";
import { estimateMacros, norm } from "../../lib/foodEngine";
import { useStore } from "../../store";
import { C } from "../../theme";

type Phase = "scan" | "loading" | "product" | "manual";

export default function BarcodeScanner({ visible, onClose, meal }: { visible: boolean; onClose: () => void; meal: string }) {
  const st = useStore(), toast = useToast(), insets = useSafeAreaInsets();
  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("scan");
  const [code, setCode] = useState("");
  const [prod, setProd] = useState<OnlineFood | null>(null);
  const [grams, setGrams] = useState("100");
  const [err, setErr] = useState("");
  // manual form
  const [mName, setMName] = useState(""), [mKcal, setMKcal] = useState(""), [mServing, setMServing] = useState("");
  const [mP, setMP] = useState(""), [mC, setMC] = useState(""), [mF, setMF] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    if (!visible) return;
    setPhase("scan"); setCode(""); setProd(null); setErr(""); busy.current = false;
    setMName(""); setMKcal(""); setMServing(""); setMP(""); setMC(""); setMF("");
    if (perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [visible]);

  const onScan = async (data: string) => {
    if (busy.current) return;
    busy.current = true;
    setCode(data); setPhase("loading");
    const saved = st.customByBarcode(data);
    if (saved && saved.kcal100 != null) {
      setProd({ name: saved.name, kcal100: saved.kcal100, p: saved.p, c: saved.c, f: saved.f, fib: saved.fib, serving_g: saved.serving_g, barcode: data });
      setGrams(String(saved.serving_g ?? 100)); setPhase("product");
      return;
    }
    try {
      const f = await fetchBarcode(data);
      if (f) { setProd(f); setGrams(String(f.serving_g ?? 100)); setPhase("product"); }
      else { setErr("This product isn't in the online database yet. Enter it from the label once and FitFaaz will remember it."); setPhase("manual"); }
    } catch {
      setErr("Couldn't reach the online database. Check your internet, or enter it from the label.");
      setPhase("manual");
    }
  };

  const g = +grams > 0 ? +grams : 0;
  const vals = (p: OnlineFood) => {
    const k = g / 100;
    const kcal = p.kcal100 * k;
    const has = p.p != null && p.c != null && p.f != null;
    const m = has ? { p: p.p! * k, c: p.c! * k, f: p.f! * k, fib: (p.fib ?? 0) * k } : estimateMacros(kcal, p.name);
    return { kcal, ...m, est: !has };
  };

  const add = (p: OnlineFood) => {
    if (!g) return;
    const name = norm(p.name);
    st.saveCustom({
      name, kcal_serving: null, kcal100: p.kcal100, serving_g: p.serving_g, src: "barcode",
      p: p.p, c: p.c, f: p.f, fib: p.fib, barcode: p.barcode ?? code,
    });
    const v = vals(p);
    const entry = p.serving_g && Math.abs(g - p.serving_g) < 0.5 ? `1 serving ${name}` : `${Math.round(g)} g ${name}`;
    st.addFood(entry, { ...v, grams: g, src: "barcode" }, meal);
    toast(`Added · ${Math.round(v.kcal)} kcal`);
    onClose();
  };

  const saveManual = () => {
    const k = +mKcal;
    if (!mName.trim() || !(k > 0)) return;
    const num = (s: string) => (s.trim() && !isNaN(+s) ? +s : null);
    const p: OnlineFood = {
      name: mName.trim(), kcal100: k, p: num(mP), c: num(mC), f: num(mF), fib: null,
      serving_g: num(mServing), barcode: code || undefined,
    };
    setProd(p); setGrams(String(p.serving_g ?? 100)); setPhase("product");
  };

  const scanning = visible && phase === "scan";
  return (
    <>
      <Modal visible={scanning} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {perm?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "itf14"] }}
              onBarcodeScanned={({ data }) => onScan(data)}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 30 }}>
              <T c="#fff" style={{ textAlign: "center", marginBottom: 16 }}>FitFaaz needs the camera to read barcodes.</T>
              <Btn label="Allow camera" onPress={requestPerm} />
            </View>
          )}
          <View style={[sc.top, { paddingTop: insets.top + 12 }]}>
            <T w="semibold" c="#fff" size={17}>Scan a barcode</T>
            <Pressable onPress={onClose} hitSlop={10}><T c="#fff" size={16}>Close</T></Pressable>
          </View>
          {perm?.granted ? <View pointerEvents="none" style={sc.frame} /> : null}
          <View style={[sc.bottom, { paddingBottom: insets.bottom + 20 }]}>
            <T c="#fff" size={14} style={{ textAlign: "center" }}>Point at the barcode on the packet</T>
            <Pressable onPress={() => { setErr(""); setPhase("manual"); }} style={{ marginTop: 12 }}>
              <T c="#fff" w="semibold" size={14} style={{ textAlign: "center", textDecorationLine: "underline" }}>Enter from the label instead</T>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Sheet visible={visible && phase !== "scan"} onClose={onClose}>
        {phase === "loading" ? (
          <View style={{ padding: 30, alignItems: "center", gap: 10 }}>
            <ActivityIndicator color={C.leaf} />
            <T c={C.muted}>Looking up {code}…</T>
          </View>
        ) : null}

        {phase === "product" && prod ? (
          <View>
            <T w="bold" size={19}>{prod.name}</T>
            <T c={C.muted} size={13} style={{ marginTop: 4 }}>
              Per 100 g: {prod.kcal100} kcal{prod.p != null ? ` · ${macroLine(prod)}` : ""}{prod.serving_g ? ` · serving ${Math.round(prod.serving_g)} g` : ""}
            </T>
            <SheetLabel>How much did you have? (grams)</SheetLabel>
            <Chips
              options={[
                ...(prod.serving_g ? [[String(prod.serving_g), `1 serving (${Math.round(prod.serving_g)} g)`] as [string, string]] : []),
                ...(prod.serving_g ? [[String(prod.serving_g * 2), "2 servings"] as [string, string]] : []),
                ["100", "100 g"] as [string, string],
              ]}
              value={grams}
              onPick={setGrams}
            />
            <SheetInput value={grams} onChangeText={setGrams} keyboardType="decimal-pad" placeholder="grams" />
            {g ? (() => {
              const v = vals(prod);
              return (
                <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: C.bg }}>
                  <T w="bold" size={22}>{Math.round(v.kcal)} kcal</T>
                  <T c={C.muted} size={14}>{macroLine(v)}{v.est ? " · macros estimated" : ""}</T>
                </View>
              );
            })() : null}
            <Btn kind="dark" label="Add" onPress={() => add(prod)} disabled={!g} style={{ marginTop: 16, paddingVertical: 14 }} />
          </View>
        ) : null}

        {phase === "manual" ? (
          <View>
            <T w="bold" size={19}>Enter from the label</T>
            {err ? <Note style={{ marginTop: 4 }}>{err}</Note> : null}
            {code ? <T c={C.muted} size={13} style={{ marginTop: 4 }}>Barcode {code}</T> : null}
            <SheetLabel>Product name</SheetLabel>
            <SheetInput value={mName} onChangeText={setMName} placeholder="e.g. Sunfeast Marie Light" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><SheetLabel>kcal per 100 g</SheetLabel><SheetInput value={mKcal} onChangeText={setMKcal} keyboardType="decimal-pad" /></View>
              <View style={{ flex: 1 }}><SheetLabel>Serving size (g)</SheetLabel><SheetInput value={mServing} onChangeText={setMServing} keyboardType="decimal-pad" placeholder="optional" /></View>
            </View>
            <SheetLabel>Per 100 g, optional (leave blank to estimate)</SheetLabel>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><SheetInput value={mP} onChangeText={setMP} keyboardType="decimal-pad" placeholder="Protein" /></View>
              <View style={{ flex: 1 }}><SheetInput value={mC} onChangeText={setMC} keyboardType="decimal-pad" placeholder="Carbs" /></View>
              <View style={{ flex: 1 }}><SheetInput value={mF} onChangeText={setMF} keyboardType="decimal-pad" placeholder="Fat" /></View>
            </View>
            <Btn kind="dark" label="Next" onPress={saveManual} disabled={!mName.trim() || !(+mKcal > 0)} style={{ marginTop: 16, paddingVertical: 14 }} />
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

const sc = StyleSheet.create({
  top: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  frame: { position: "absolute", top: "35%", left: "12%", right: "12%", height: 160, borderWidth: 3, borderColor: C.turmeric, borderRadius: 18 },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20 },
});
