import React from "react";
import { View } from "react-native";
import type { MacroTargets } from "../lib/types";
import { C } from "../theme";
import { T } from "./ui";

export const MACRO_COLORS = { p: "#3F7A56", c: "#E3A21A", f: "#8E6C9E" };

export function MacroBars({ p, c, f, targets }: { p: number; c: number; f: number; targets: MacroTargets }) {
  const rows: [string, number, number, string][] = [
    ["Protein", p, targets.p, MACRO_COLORS.p],
    ["Carbs", c, targets.c, MACRO_COLORS.c],
    ["Fat", f, targets.f, MACRO_COLORS.f],
  ];
  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
      {rows.map(([label, v, t, color]) => (
        <View key={label} style={{ flex: 1 }}>
          <T size={13} c={C.muted}>{label}</T>
          <T w="semibold" size={15} style={{ marginVertical: 3 }}>
            {Math.round(v)}<T size={12} c={C.muted}> / {Math.round(t)} g</T>
          </T>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: C.sunk, overflow: "hidden" }}>
            <View style={{ width: `${Math.min(100, t ? (v / t) * 100 : 0)}%`, height: "100%", backgroundColor: color, borderRadius: 3 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** "P 12 · C 40 · F 6 g" */
export const macroLine = (m: { p: number | null; c: number | null; f: number | null }) =>
  `P ${Math.round(m.p ?? 0)} · C ${Math.round(m.c ?? 0)} · F ${Math.round(m.f ?? 0)} g`;
