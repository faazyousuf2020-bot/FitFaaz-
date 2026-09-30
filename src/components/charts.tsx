import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { niceMax, short } from "../lib/util";
import { C, F } from "../theme";

const CW = 330, CH = 180, CL = 34, CR = 6, CT = 8, CB = 24;

function Frame({ children }: { children: React.ReactNode }) {
  const [w, setW] = useState(0);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 ? (
        <Svg width={w} height={(w * CH) / CW} viewBox={`0 0 ${CW} ${CH}`}>{children}</Svg>
      ) : <View style={{ aspectRatio: CW / CH }} />}
    </View>
  );
}

function Axis({ max, fmt }: { max: number; fmt: (v: number) => string }) {
  return (
    <>
      {[0, 0.5, 1].map((t) => {
        const y = CT + (CH - CT - CB) * (1 - t);
        return (
          <G key={t}>
            <Line x1={CL} x2={CW - CR} y1={y} y2={y} stroke={C.line} strokeWidth={1} strokeDasharray={t ? "2 3" : undefined} />
            <SvgText x={CL - 6} y={y + 4} textAnchor="end" fontSize={10} fill={C.muted} fontFamily={F.regular}>{fmt(max * t)}</SvgText>
          </G>
        );
      })}
    </>
  );
}

function XLabels({ labels, xAt, maxLabels = 7 }: { labels: string[]; xAt: (i: number) => number; maxLabels?: number }) {
  const n = labels.length, step = n > maxLabels ? Math.ceil(n / maxLabels) : 1;
  return (
    <>
      {labels.map((l, i) =>
        (i % step === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < step / 1.5 && n > 8) ? (
          <SvgText key={i} x={xAt(i)} y={CH - 6} textAnchor="middle" fontSize={10} fill={C.muted} fontFamily={F.regular}>{l}</SvgText>
        ) : null,
      )}
    </>
  );
}

export function BarChart({ values, labels, colors, line, onTap, fmt = short, faded = [] }: {
  values: number[]; labels: string[]; colors: string[]; line?: number[]; onTap: (i: number) => void;
  fmt?: (v: number) => string; faded?: number[];
}) {
  const n = Math.max(1, values.length);
  const max = niceMax(Math.max(1, ...values, ...(line ?? [])) * 1.08);
  const iw = (CW - CL - CR) / n, bw = Math.max(3, Math.min(22, iw * 0.64));
  const y = (v: number) => CT + (CH - CT - CB) * (1 - v / max);
  const xAt = (i: number) => CL + i * iw + iw / 2;
  return (
    <Frame>
      <Axis max={max} fmt={fmt} />
      {values.map((v, i) => {
        const h = CH - CB - y(v);
        return (
          <G key={i} onPress={() => onTap(i)}>
            <Rect x={CL + i * iw} y={CT} width={iw} height={CH - CT - CB} fill="transparent" />
            <Rect x={xAt(i) - bw / 2} y={y(v)} width={bw} height={Math.max(h, v ? 1.5 : 0)} rx={Math.min(4, bw / 3)}
              fill={colors[i]} opacity={faded.includes(i) ? 0.45 : 1} />
          </G>
        );
      })}
      {line ? (
        <Polyline points={line.map((v, i) => `${xAt(i)},${y(v)}`).join(" ")} fill="none" stroke={C.ink} strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />
      ) : null}
      <XLabels labels={labels} xAt={xAt} />
    </Frame>
  );
}

export function LineChart({ values, labels, onTap, fmt = short, trend }: {
  values: number[]; labels: string[]; onTap: (i: number) => void; fmt?: (v: number) => string; trend?: [number, number];
}) {
  const n = values.length, max = niceMax(Math.max(1, ...values) * 1.12);
  const xAt = (i: number) => (n === 1 ? (CL + CW - CR) / 2 : CL + 10 + (i * (CW - CL - CR - 20)) / (n - 1));
  const y = (v: number) => CT + (CH - CT - CB) * (1 - v / max);
  return (
    <Frame>
      <Axis max={max} fmt={fmt} />
      {trend && n > 1 ? (
        <Line x1={xAt(0)} y1={y(trend[0])} x2={xAt(n - 1)} y2={y(trend[1])} stroke={C.turmeric} strokeWidth={2} strokeDasharray="5 4" />
      ) : null}
      <Polyline points={values.map((v, i) => `${xAt(i)},${y(v)}`).join(" ")} fill="none" stroke={C.leaf} strokeWidth={2.5} strokeLinejoin="round" />
      {values.map((v, i) => (
        <G key={i} onPress={() => onTap(i)}>
          <Circle cx={xAt(i)} cy={y(v)} r={12} fill="transparent" />
          <Circle cx={xAt(i)} cy={y(v)} r={4} fill={C.surface} stroke={C.leaf} strokeWidth={2} />
        </G>
      ))}
      <XLabels labels={labels} xAt={xAt} maxLabels={4} />
    </Frame>
  );
}

export const Legend = ({ items }: { items: [string, string, boolean?][] }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 10, marginHorizontal: 4 }}>
    {items.map(([color, label, isLine]) => (
      <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={isLine ? { width: 14, height: 2, backgroundColor: color } : { width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
        <SvgLabel>{label}</SvgLabel>
      </View>
    ))}
  </View>
);
const SvgLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.muted }}>{children}</Text>
);
