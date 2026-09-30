import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Reminders } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const DEFAULT_REMINDERS: Reminders = {
  walk: { on: false, time: "06:30" },
  food: { on: false, time: "21:00" },
  workout: { on: false, time: "07:00" },
};

const TEXT: Record<keyof Reminders, [string, string]> = {
  walk: ["Time for your walk", "Open FitFaaz and tap Start when you head out."],
  food: ["Log today's food", "A quick check: is everything you ate today logged?"],
  workout: ["Today's workout", "Check your plan and log each exercise as you go."],
};

export const parseHM = (s: string): [number, number] | null => {
  const m = s.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  if (h > 23 || mi > 59) return null;
  return [h, mi];
};

/** Replace all scheduled reminders with the current settings. Returns an error message or null. */
export async function applyReminders(r: Reminders): Promise<string | null> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const any = Object.values(r).some((x) => x.on);
  if (!any) return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return "Notifications are blocked for FitFaaz. Allow them in phone settings.";
  for (const key of Object.keys(r) as (keyof Reminders)[]) {
    const it = r[key];
    const hm = parseHM(it.time);
    if (!it.on || !hm) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: TEXT[key][0], body: TEXT[key][1] },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hm[0], minute: hm[1], channelId: "reminders" },
    });
  }
  return null;
}
