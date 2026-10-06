export const setNotificationHandler = () => {}; export const AndroidImportance = { HIGH: 4 };
export const SchedulableTriggerInputTypes = { DAILY: "daily", TIME_INTERVAL: "timeInterval" };
let n = 0; export const scheduled = [];
export const scheduleNotificationAsync = async (x) => { scheduled.push(x); globalThis.__notifs = scheduled; return "n" + ++n; };
export const cancelScheduledNotificationAsync = async () => {}; export const cancelAllScheduledNotificationsAsync = async () => {};
export const setNotificationChannelAsync = async () => {};
export const getPermissionsAsync = async () => ({ granted: true }); export const requestPermissionsAsync = async () => ({ granted: true });
