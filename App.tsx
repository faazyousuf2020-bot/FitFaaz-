import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { T, ToastProvider } from "./src/components/ui";
import Food from "./src/screens/Food";
import Settings from "./src/screens/Settings";
import Today from "./src/screens/Today";
import Walk from "./src/screens/Walk";
import Workout from "./src/screens/Workout";
import { StoreProvider, useStore } from "./src/store";
import { C } from "./src/theme";
import { dMed } from "./src/lib/util";
import { WalkProvider } from "./src/walk";

type Tab = "today" | "walk" | "food" | "workout";

const ICON: Record<Tab, (c: string) => React.ReactNode> = {
  today: (c) => <><Rect x={3} y={4} width={18} height={17} rx={3} stroke={c} /><Path d="M3 9h18M8 2v4M16 2v4" stroke={c} /></>,
  walk: (c) => <><Circle cx={13} cy={4} r={2} stroke={c} /><Path d="M9 21l2-6 3 3v3M7 12l2-4 4 1 2 4 3 1M11 15l-1-5" stroke={c} /></>,
  food: (c) => <Path d="M4 12h16a8 8 0 0 1-16 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4" stroke={c} />,
  workout: (c) => <Path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" stroke={c} />,
};
const LABEL: Record<Tab, string> = { today: "Today", walk: "Walk", food: "Food", workout: "Workout" };

function Shell() {
  const insets = useSafeAreaInsets();
  const st = useStore();
  const [tab, setTab] = useState<Tab>("today");
  const [panes, setPanes] = useState<Record<string, string>>({ walk: "track", food: "log", workout: "log" });
  const [settings, setSettings] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const go = useCallback((t: string, p?: string) => {
    setTab(t as Tab);
    if (p) setPanes((x) => ({ ...x, [t]: p }));
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const setPane = (t: string) => (p: string) => setPanes((x) => ({ ...x, [t]: p }));

  // Android back: go to Today first instead of closing the app
  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (tab !== "today") { go("today"); return true; }
      return false;
    });
    return () => sub.remove();
  }, [tab, go]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <T w="bold" size={24} style={{ letterSpacing: -0.5 }}>Fit<T w="bold" size={24} c={C.tealText}>Faaz</T></T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <T c={C.muted} size={14}>{dMed(st.todayISO)}</T>
          <Pressable onPress={() => setSettings(true)} style={styles.iconBtn} accessibilityLabel="Your details and settings">
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
              <Circle cx={12} cy={8} r={4} stroke={C.ink} /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={C.ink} />
            </Svg>
          </Pressable>
        </View>
      </View>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {tab === "today" && <Today go={go} openProfile={() => setSettings(true)} />}
        {tab === "walk" && <Walk pane={panes.walk} setPane={setPane("walk")} />}
        {tab === "food" && <Food pane={panes.food} setPane={setPane("food")} />}
        {tab === "workout" && <Workout pane={panes.workout} setPane={setPane("workout")} go={go} />}
      </ScrollView>
      <View style={[styles.nav, { paddingBottom: 10 + insets.bottom }]}>
        {(Object.keys(LABEL) as Tab[]).map((t) => {
          const on = t === tab, c = on ? C.ink : C.inkMuted;
          return (
            <Pressable key={t} onPress={() => go(t)} style={[styles.navBtn, on && { backgroundColor: C.turmeric }]} accessibilityRole="tab">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{ICON[t](c)}</Svg>
              <T size={12} w={on ? "semibold" : "regular"} c={c}>{LABEL[t]}</T>
            </Pressable>
          );
        })}
      </View>
      <Settings visible={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <WalkProvider>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </WalkProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  nav: { flexDirection: "row", gap: 4, backgroundColor: C.ink, paddingTop: 10, paddingHorizontal: 10 },
  navBtn: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 6, borderRadius: 14 },
});
