import React from "react";
import { View } from "react-native";
import { Btn, Del, Row, T, useToast } from "../components/ui";
import type { PlanItem } from "../lib/types";
import { isWalk, planStatus, woDesc } from "../lib/workout";
import { useStore } from "../store";
import { C } from "../theme";
import { useWalk } from "../walk";

const ST = {
  done: { bg: C.leaf, fg: "#fff", mark: "✓", label: "Done", border: undefined },
  part: { bg: C.turmericSoft, fg: C.turmericInk, mark: "½", label: "Partly done", border: undefined },
  miss: { bg: C.dangerSoft, fg: C.danger, mark: "×", label: "Missed", border: undefined },
  todo: { bg: "transparent", fg: C.ink, mark: "", label: "Planned", border: C.line },
};

export function usePlanStatus() {
  const st = useStore(), walk = useWalk();
  const live = walk.active && walk.active.date === st.todayISO ? walk.secs : 0;
  return (date: string, item: PlanItem) => planStatus(date, item, st.todayISO, st.walks, st.workouts, live);
}

export function PlanRow({ item, withLog, onGoWalk, onLongPress }: { item: PlanItem; withLog: boolean; onGoWalk?: () => void; onLongPress?: () => void }) {
  const st = useStore(), toast = useToast(), status = usePlanStatus()(item.date, item);
  const S = ST[status];
  const isToday = item.date === st.todayISO;
  const canLog = withLog && isToday && status !== "done" && !isWalk(item.name);
  const canWalk = withLog && isToday && status !== "done" && isWalk(item.name);
  return (
    <Row
      onLongPress={onLongPress}
      left={
        <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: S.bg, borderWidth: S.border ? 1.5 : 0, borderColor: S.border }}>
          <T w="bold" size={12} c={S.fg}>{S.mark}</T>
        </View>
      }
      title={item.name}
      sub={[...woDesc(item), S.label].join(" · ")}
      right={
        <>
          {canLog ? <Btn small label="Log" onPress={() => { st.addWorkout(item); toast(`Logged ${item.name}`); }} /> : null}
          {canWalk ? <Btn small label="Walk" onPress={() => onGoWalk?.()} /> : null}
          {!withLog ? <Del label={`Remove ${item.name}`} onPress={() => st.delPlan(item.id)} /> : null}
        </>
      }
    />
  );
}
