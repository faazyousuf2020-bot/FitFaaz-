import React from "react";
import { View } from "react-native";
import { Seg } from "../components/ui";
import Log from "./workout/Log";
import Plan from "./workout/Plan";
import Progress from "./workout/Progress";

export default function Workout({ pane, setPane, go }: { pane: string; setPane: (p: string) => void; go: (t: string, p?: string) => void }) {
  return (
    <View>
      <Seg options={[["log", "Log"], ["progress", "Progress"], ["plan", "Plan"]]} value={pane} onPick={setPane} />
      {pane === "log" ? <Log /> : pane === "progress" ? <Progress /> : <Plan go={go} />}
    </View>
  );
}
