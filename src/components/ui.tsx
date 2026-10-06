import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps,
  TextStyle, View, ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "../theme";

export function T({ style, w = "regular", c, size, children, ...rest }: {
  style?: TextStyle | TextStyle[]; w?: keyof typeof F; c?: string; size?: number; children?: React.ReactNode; numberOfLines?: number;
}) {
  return (
    <Text {...rest} style={[{ fontFamily: F[w], color: c ?? C.ink, fontSize: size ?? 15 }, style as TextStyle]}>
      {children}
    </Text>
  );
}

export const H2 = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <T w="semibold" size={17} style={[{ marginTop: 22, marginBottom: 10, marginHorizontal: 4 }, style ?? {}]}>{children}</T>
);

export const Panel = ({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) => (
  <View style={[s.panel, style as ViewStyle]}>{children}</View>
);

export function Row({ title, sub, right, onPress, onLongPress, left }: {
  title: React.ReactNode; sub?: string; right?: React.ReactNode; onPress?: () => void; onLongPress?: () => void; left?: React.ReactNode;
}) {
  const inner = (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        {left}
        <View style={{ flex: 1 }}>
          {typeof title === "string" ? <T>{title}</T> : title}
          {sub ? <T c={C.muted} size={13} style={{ marginTop: 2 }}>{sub}</T> : null}
        </View>
      </View>
      {right ? <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{right}</View> : null}
    </>
  );
  return onPress || onLongPress ? (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={350}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: "#F1EADC" }]}>{inner}</Pressable>
  ) : <View style={s.row}>{inner}</View>;
}

export const Val = ({ children }: { children: React.ReactNode }) => <T w="semibold">{children}</T>;

export const Del = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={8} style={s.del}>
    <T c={C.muted} size={20} style={{ lineHeight: 22 }}>×</T>
  </Pressable>
);

export function Chips<V extends string | number>({ options, value, onPick, style }: {
  options: [V, string][]; value: V; onPick: (v: V) => void; style?: ViewStyle;
}) {
  return (
    <View style={[s.chips, style]}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onPick(v)} style={[s.chip, on && { backgroundColor: C.ink }]}>
            <T size={14} c={on ? C.surface : C.muted}>{l}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Seg<V extends string>({ options, value, onPick }: { options: [V, string][]; value: V; onPick: (v: V) => void }) {
  return (
    <View style={s.seg}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable key={v} onPress={() => onPick(v)} style={[s.segBtn, on && s.segOn]}>
            <T w={on ? "semibold" : "medium"} c={on ? C.inkText : C.muted} size={15}>{l}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Tile = ({ k, v, unit, sub, vColor, onPress }: {
  k: string; v: React.ReactNode; unit?: string; sub?: string; vColor?: string; onPress?: () => void;
}) => {
  const body = (
    <>
      <T c={C.muted} size={13}>{k}</T>
      <T w="bold" size={23} c={vColor} style={{ marginTop: 4, letterSpacing: -0.4 }}>
        {v}{unit ? <T w="medium" size={13} c={C.muted}> {unit}</T> : null}
      </T>
      {sub ? <T c={C.muted} size={13}>{sub}</T> : null}
    </>
  );
  return onPress ? <Pressable onPress={onPress} style={s.tile}>{body}</Pressable> : <View style={s.tile}>{body}</View>;
};
export const Grid = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[s.grid, style]}>{children}</View>
);

export function Field({ value, onChangeText, onSubmit, button, disabled, inputRef, ...rest }: TextInputProps & {
  onSubmit?: () => void; button?: string; disabled?: boolean; inputRef?: React.Ref<TextInput>;
}) {
  return (
    <View style={s.field}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9A9284"
        onSubmitEditing={() => !disabled && onSubmit?.()}
        returnKeyType="done"
        submitBehavior="submit"
        style={s.input}
        {...rest}
      />
      {button ? (
        <Pressable disabled={disabled} onPress={onSubmit} style={[s.add, disabled && { opacity: 0.35 }]}>
          <T w="semibold" c={C.surface}>{button}</T>
        </Pressable>
      ) : null}
    </View>
  );
}

type BtnKind = "primary" | "stop" | "ghost" | "dark";
export function Btn({ label, onPress, kind = "primary", small, style, disabled }: {
  label: string; onPress: () => void; kind?: BtnKind; small?: boolean; style?: ViewStyle; disabled?: boolean;
}) {
  const bg = { primary: C.turmeric, stop: C.sunk, ghost: C.sunk, dark: C.ink }[kind];
  const fg = { primary: C.turmericInk, stop: C.danger, ghost: C.ink, dark: C.surface }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { backgroundColor: bg, paddingVertical: small ? 7 : 12, paddingHorizontal: small ? 12 : 18, borderRadius: small ? 10 : 14, alignItems: "center" },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      <T w="semibold" c={fg} size={small ? 14 : 15}>{label}</T>
    </Pressable>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <T c={C.muted} size={14} style={{ paddingVertical: 10, paddingHorizontal: 4 }}>{children}</T>
);
export const Note = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <T c={C.muted} size={13} style={[{ marginTop: 10, lineHeight: 19 }, style ?? {}]}>{children}</T>
);
export const Verdict = ({ tone, children }: { tone: "up" | "down" | "flat"; children: React.ReactNode }) => (
  <View style={[s.verdict, { backgroundColor: tone === "up" ? C.leafSoft : tone === "down" ? C.dangerSoft : C.sunk }]}>
    <T size={14.5} style={{ lineHeight: 21 }}>{children}</T>
  </View>
);
export const Rest = ({ children }: { children: React.ReactNode }) => (
  <View style={s.rest}><T c={C.muted} size={14}>{children}</T></View>
);
export const GroupHead = ({ left, right, style }: { left: string; right?: string; style?: ViewStyle }) => (
  <View style={[{ flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 8, marginHorizontal: 4 }, style]}>
    <T c={C.muted} size={14}>{left}</T>
    {right ? <T w="semibold" size={14}>{right}</T> : null}
  </View>
);
export const Meter = ({ frac, over, height = 10, dark }: { frac: number; over?: boolean; height?: number; dark?: boolean }) => (
  <View style={{ height, borderRadius: height / 2, backgroundColor: dark ? C.inkTrack : C.sunk, overflow: "hidden" }}>
    <View style={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%`, height: "100%", borderRadius: height / 2, backgroundColor: over ? C.danger : C.leaf }} />
  </View>
);

/* ---------- sheet ---------- */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={s.scrim} onPress={onClose} />
        <View style={[s.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={s.grab} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export const SheetLabel = ({ children }: { children: string }) => (
  <T c={C.muted} size={14} style={{ marginTop: 14, marginBottom: 6 }}>{children}</T>
);
export const SheetInput = (p: TextInputProps) => (
  <TextInput placeholderTextColor="#9A9284" {...p} style={[s.sheetInput, p.style as TextStyle]} />
);

/* ---------- toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const show = useCallback((m: string) => {
    setMsg(m);
    Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }).start(), 2000);
  }, [op]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={[s.toast, { bottom: 92 + insets.bottom, opacity: op, transform: [{ translateY: op.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
        <T c={C.surface} size={14}>{msg}</T>
      </Animated.View>
    </ToastCtx.Provider>
  );
}

export const s = StyleSheet.create({
  panel: { backgroundColor: C.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: C.line },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, backgroundColor: C.surface, borderRadius: 12, marginBottom: 6,
  },
  del: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: C.sunk },
  seg: { flexDirection: "row", gap: 4, backgroundColor: C.sunk, padding: 4, borderRadius: 14, marginBottom: 14 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  segOn: { backgroundColor: C.ink },
  tile: { flexBasis: "48%", flexGrow: 1, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.line },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  field: {
    flexDirection: "row", gap: 8, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, borderRadius: 16,
    paddingVertical: 6, paddingRight: 6, paddingLeft: 14, alignItems: "center",
  },
  input: { flex: 1, fontFamily: F.regular, fontSize: 16, color: C.ink, paddingVertical: 8, minWidth: 0 },
  add: { backgroundColor: C.ink, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  verdict: { padding: 14, paddingHorizontal: 16, borderRadius: 16, marginTop: 10 },
  rest: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: C.line, marginBottom: 6 },
  scrim: { flex: 1, backgroundColor: "rgba(29,53,48,0.35)" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 12, paddingHorizontal: 20, maxHeight: "88%" },
  grab: { width: 40, height: 4, borderRadius: 4, backgroundColor: C.line, alignSelf: "center", marginBottom: 14 },
  sheetInput: {
    borderWidth: 1.5, borderColor: C.line, borderRadius: 12, backgroundColor: C.bg, paddingVertical: 11, paddingHorizontal: 14,
    fontFamily: F.regular, fontSize: 16, color: C.ink,
  },
  toast: { position: "absolute", alignSelf: "center", backgroundColor: C.ink, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
});

/** A number with − and + buttons: "Sets  [−] 3 [+]". */
export function Stepper({ label, value, onChange, min = 0, max = 999, step = 1, format }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number | ((v: number, dir: 1 | -1) => number);
  format?: (v: number) => string;
}) {
  const next = (dir: 1 | -1) => {
    const d = typeof step === "function" ? step(value, dir) : step;
    onChange(Math.min(max, Math.max(min, value + dir * d)));
  };
  const btn = (dir: 1 | -1) => (
    <Pressable onPress={() => next(dir)} accessibilityLabel={`${dir > 0 ? "More" : "Fewer"} ${label.toLowerCase()}`}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
        backgroundColor: pressed ? C.line : C.sunk })}>
      <T w="bold" size={22}>{dir > 0 ? "+" : "−"}</T>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, minWidth: 140 }}>
      <T c={C.muted} size={13} style={{ marginBottom: 4, marginLeft: 2 }}>{label}</T>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, padding: 4 }}>
        {btn(-1)}
        <T w="bold" size={20} style={{ flex: 1, textAlign: "center" }}>{format ? format(value) : value}</T>
        {btn(1)}
      </View>
    </View>
  );
}
