// Test entry: load the SQL engine, make alerts clickable from the test, then start the real app.
import initSqlJs from "sql.js/dist/sql-asm.js";
import { Alert } from "react-native";
Alert.alert = (title, message, buttons) => { globalThis.__alert = { title, message, buttons: buttons ?? [{ text: "OK" }] }; };
globalThis.__pressAlert = (text) => { const a = globalThis.__alert; globalThis.__alert = null; const b = a?.buttons.find((x) => x.text === text); b?.onPress?.(); return !!b; };
initSqlJs().then((SQL) => { globalThis.__SQL = SQL; require("../index"); });
