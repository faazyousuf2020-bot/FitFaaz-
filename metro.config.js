// Default Expo config. For the in-browser test run (FITFAAZ_E2E=1) phone-only modules are swapped for test stand-ins.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const config = getDefaultConfig(__dirname);

if (process.env.FITFAAZ_E2E) {
  const shim = (n) => path.join(__dirname, "e2e/shims", n);
  const SHIMS = {
    "expo-sqlite": shim("sqlite.js"),
    "react-native-webview": shim("webview.js"),
    "expo-task-manager": shim("taskmanager.js"),
    "expo-location": shim("location.js"),
    "expo-sensors": shim("sensors.js"),
    "expo-notifications": shim("notifications.js"),
    "expo-camera": shim("camera.js"),
    "expo-file-system": shim("empty.js"),
    "expo-sharing": shim("empty.js"),
    "expo-document-picker": shim("empty.js"),
  };
  const orig = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (ctx, name, platform) => {
    if (platform === "web" && SHIMS[name]) return { type: "sourceFile", filePath: SHIMS[name] };
    return orig ? orig(ctx, name, platform) : ctx.resolveRequest(ctx, name, platform);
  };
}
module.exports = config;
