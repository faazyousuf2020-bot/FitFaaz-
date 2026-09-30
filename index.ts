import { registerRootComponent } from "expo";

// Registers the background GPS task before anything else runs (needed when Android wakes the app for location updates).
import "./src/lib/walkTracker";
import "./src/lib/reminders";
import App from "./App";

registerRootComponent(App);
