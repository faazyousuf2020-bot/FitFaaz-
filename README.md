# FitFaaz

Personal walk, food and workout journal for Android (Expo SDK 56, React Native, TypeScript).

- **Today**: calories eaten vs estimated maintenance, steps, distance, walking burn, workout minutes, today's plan
- **Walk**: GPS tracking that keeps running with the screen off (foreground service), live map, phone step sensor, pace, calories, history with route maps, progress charts
- **Food**: type "2 idli, 1 cup sambar"; built-in South Indian list; Open Food Facts lookup for anything else; your own calorie values are remembered
- **Workout**: session timer, "pushups 3x15" logging, per-exercise trends, weekly planner that ticks off automatically
- **Settings**: your details, daily reminders, backup/restore to a file

All data is stored on the phone in SQLite.

## Build

Every push to `main` runs `.github/workflows/android.yml`, which builds a release APK and publishes it under **Releases**. Download the APK on the phone to install or update.
