import React from "react";
import { View } from "react-native";
import type { MacroTargets } from "../lib/types";
import { C } from "../theme";
import { T } from "./ui";

export const MACRO_COLORS = { p: "#00A99D", c: "#121212", f: "#9C8B6E" };

export function MacroBars({ p, c, f, targets, dark }: { p: number; c: number; f: number; targets: MacroTargets; dark?: boolean }) {
  const rows: [string, number, number, string][] = [
    ["Protein", p, targets.p, dark ? C.leaf : MACRO_COLORS.p],
    ["Carbs", c, targets.c, dark ? C.inkText : MACRO_COLORS.c],
    ["Fat", f, targets.f, dark ? C.inkMuted : MACRO_COLORS.f],
  ];
  const muted = dark ? C.inkMuted : C.muted, text = dark ? C.inkText : C.ink, track = dark ? C.inkTrack : C.sunk;
  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
      {rows.map(([label, v, t, color]) => (
        <View key={label} style={{ flex: 1 }}>
          <T size={13} c={muted}>{label}</T>
          <T w="semibold" size={15} c={text} style={{ marginVertical: 3 }}>
            {Math.round(v)}<T size={12} c={muted}> / {Math.round(t)} g</T>
          </T>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: track, overflow: "hidden" }}>
            {/* crimson only when carbs or fat pass their target by more than 10% */}
            <View style={{ width: `${Math.min(100, t ? (v / t) * 100 : 0)}%`, height: "100%", backgroundColor: label !== "Protein" && t && v > t * 1.1 ? C.danger : color, borderRadius: 3 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** "P 12 · C 40 · F 6 g" */
export const macroLine = (m: { p: number | null; c: number | null; f: number | null }) =>
  `P ${Math.round(m.p ?? 0)} · C ${Math.round(m.c ?? 0)} · F ${Math.round(m.f ?? 0)} g`;
